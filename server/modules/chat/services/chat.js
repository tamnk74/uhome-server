import uuid, { v4 as uuidv4 } from 'uuid';
import Sequelize, { Op } from 'sequelize';
import { get, isNil, pick, isEmpty, sumBy, set } from 'lodash';
import { saleEventTypes, currencies } from 'constants';

import ChatMember from '../../../models/chatMember';
import { twilioClient } from '../../../helpers/Twilio';
import ChatChannel from '../../../models/chatChannel';
import User from '../../../models/user';
import ChatUser from '../../../models/chatUser';
import UserEvent from '../../../models/userEvent';
import ReceiveIssue from '../../../models/receiveIssue';
import {
  commandMessage,
  issueStatus,
  command,
  transactionType,
  paymentMethod,
  eventStatuses,
  estimationMessageStatus,
  unitTime,
  issueType,
} from '../../../constants';
import { objectToSnake } from '../../../helpers/Util';
import { notificationQueue, chatMessageQueue } from '../../../helpers/Queue';
import Issue from '../../../models/issue';
import Event from '../../../models/event';
import Attachment from '../../../models/attachment';
import ReceiveIssueComment from '../../../models/receiveIssueComment';
import IssueMaterial from '../../../models/issueMaterial';
import UserProfile from '../../../models/userProfile';
import TransactionHistory from '../../../models/transactionHistory';
import sequelize from '../../../databases/database';
import EstimationMessage from '../../../models/estimationMessage';
import Uploader from '../../../helpers/Uploader';
import RequestSupporting from '../../../models/requestSupporting';
import Acceptance from '../../../models/acceptance';
import Survey from '../../../models/survey';
import FeeConfiguration from '../../../models/feeConfiguration';
import FeeCategory from '../../../models/feeCategory';
import FeeFactory from '../../../helpers/fee/FeeFactory';
import CategoryIssue from '../../../models/categoryIssue';
import LatestIssueStatus from '../../../models/latestIssueStatus';

const getIssueCost = async (receiveIssue, estimationMessage, survey) => {
  const { issueId } = receiveIssue;

  const materials = await IssueMaterial.findAll({
    where: {
      issueId,
    },
  });

  let totalMaterialCost = 0;
  const materialsCost = [];
  for (let index = 0; index < materials.length; index++) {
    const element = materials[index];
    materialsCost.push({
      cost: element.cost,
      material: element.material,
    });

    totalMaterialCost += +element.cost;
  }

  const estimationMessageData = get(estimationMessage, 'data', {});
  const worker = get(estimationMessageData, 'worker', {});
  const customer = get(estimationMessageData, 'customer', {});
  const totalCost =
    customer.cost + totalMaterialCost + get(worker, 'distanceFee', 0) + get(worker, 'surveyFee', 0);
  const totalCustomerPay = totalCost - customer.discount - customer.fee;
  const totalWorkerReceive =
    worker.cost + totalMaterialCost + get(worker, 'distanceFee', 0) + get(worker, 'surveyFee', 0);
  const amountIntoWalletWorker = totalWorkerReceive - totalCustomerPay - worker.fee;

  set(worker, 'amountIntoWallet', amountIntoWalletWorker);
  set(customer, 'amountIntoWallet', 0);
  set(worker, 'surveyFee', get(survey, 'data.surveyFee', 0));
  set(customer, 'surveyFee', get(survey, 'data.surveyFee', 0));

  return {
    ...estimationMessageData,
    worker,
    customer,
    materials: materialsCost,
    totalAmount: totalCustomerPay,
  };
};

const isValidEstimation = (payload, estimationMessage, keys = []) => {
  if (estimationMessage.status !== estimationMessageStatus.WAITING) {
    return false;
  }

  const estimation = get(estimationMessage, 'data', {});
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (get(payload, key, 0) !== get(estimation, key, 0)) {
      return false;
    }
  }

  return true;
};

export default class ChatService {
  static get filePath() {
    return 'promotions';
  }

  static async create(user, issue, data) {
    const { userId } = data;
    const issueId = issue.id;

    /* eslint-disable prefer-const */
    let [chatChannel, worker] = await Promise.all([
      ChatChannel.findChannelGroup(issueId, [userId, user.id]),
      User.findByPk(userId, {
        attributes: User.getAttributes(),
      }),
    ]);

    if (!chatChannel && issue.status !== issueStatus.OPEN) {
      throw new Error('CHAT-0404');
    }

    let isNewGroup = false;
    if (!chatChannel) {
      const channel = await twilioClient.createChannel();
      [chatChannel] = await Promise.all([
        ChatChannel.addChannel({
          channelSid: channel.sid,
          friendlyName: channel.friendlyName,
          serviceSid: channel.serviceSid,
          issueId,
        }),
        Issue.update(
          {
            status: issueStatus.CHATTING,
          },
          {
            where: {
              id: issueId,
            },
          }
        ),
      ]);
      isNewGroup = true;
    }
    const authorChat = await this.addUserToChat(chatChannel, user);
    const [workerChat] = await Promise.all([
      this.addUserToChat(chatChannel, worker),
      this.addToReviceIssue(issueId, issue.createdBy === user.id ? worker.id : user.id),
    ]);

    const host = get(issue, 'creator');
    const allowAttributes = ['id', 'avatar', 'name', 'status'];
    authorChat.setDataValue('worker', pick(worker.toJSON(), allowAttributes));
    authorChat.setDataValue('host', pick(host.toJSON(), allowAttributes));
    authorChat.setDataValue('supporting', null);
    const twilioToken = await twilioClient.getAccessToken(authorChat.identity);
    authorChat.setDataValue('token', twilioToken);

    if (isNewGroup) {
      await this.sendWelcomeMessage(chatChannel, workerChat, worker);
    }

    await LatestIssueStatus.upsert({
      id: uuid(),
      issueId: issue.id,
      userId: issue.createdBy,
      status: issueStatus.CHATTING,
    });

    return authorChat;
  }

  static async addUserToChat(chatChannel, user) {
    const member = await ChatMember.findMember(user.id, chatChannel.id);

    if (member) {
      return member;
    }

    let chatUser = await ChatUser.findUserFree(chatChannel.id);
    if (!chatUser) {
      const userTwilio = await twilioClient.createUser(uuidv4());
      [chatUser] = await Promise.all([
        ChatUser.create({
          userSid: userTwilio.sid,
          friendlyName: chatChannel.friendlyName,
          serviceSid: chatChannel.serviceSid,
          roleSid: userTwilio.roleSid,
          identity: userTwilio.identity,
        }),
      ]);
    }

    const twilioMember = await twilioClient.addMember(chatChannel.channelSid, chatUser.identity, {
      friendlyName: chatUser.friendlyName,
    });

    chatUser.totalChannel += 1;

    const [chatMember] = await Promise.all([
      ChatMember.addMember({
        identity: chatUser.identity,
        channelSid: chatChannel.channelSid,
        friendlyName: user.name,
        serviceSid: chatChannel.serviceSid,
        roleSid: chatUser.roleSid,
        userId: user.id,
        channelId: chatChannel.id,
        memberSid: twilioMember.sid,
      }),
      ChatUser.update(
        {
          totalChannel: chatUser.totalChannel + 1,
        },
        { where: { id: chatUser.id } }
      ),
    ]);

    return chatMember;
  }

  static async getToken(chatChannel, user) {
    const chatMember = await ChatMember.findOne({
      where: {
        userId: user.id,
        channelId: chatChannel.id,
      },
    });

    if (!chatMember) {
      throw new Error('CHAT-0404');
    }
    const twilioToken = await twilioClient.getAccessToken(chatMember.identity);

    return {
      token: twilioToken,
    };
  }

  static async addToReviceIssue(issueId, userId) {
    return ReceiveIssue.findOrCreate({
      where: {
        userId,
        issueId,
      },
      defaults: {
        id: uuid(),
        status: issueStatus.CHATTING,
      },
    });
  }

  static async requestCommand(type, chatChannel, user) {
    const supporterIds = await ChatMember.getSupporterIds(chatChannel.id);
    const data = {};
    const { issue } = chatChannel;
    switch (type) {
      case command.REQUEST_ACCEPTANCE:
        return this.requestAcceptance(chatChannel, user);
      case command.REQUEST_CONFIRM_PAYMENT:
        await this.requestConfirmPayment(chatChannel, user);
        break;
      default:
        set(data, 'issue.status', get(issue, 'status'));
        await this.sendMessage(type, chatChannel, user, null, data);
        break;
    }

    return ReceiveIssue.findBySupporterIds(issue.id, supporterIds);
  }

  static async getUploadVideoLink({ chatChannel, thumbnail }) {
    const name = `${uuidv4()}`;
    const path = `chat/${chatChannel.id}/videos/${name}.mp4`;
    const thumbnailPath = `chat/${chatChannel.id}/videos/thumbnails/${name}.png`;
    const [s3PreSingedLink, attachment] = await Promise.all([
      Uploader.preSignedUrl({
        path,
      }),
      Attachment.create({
        path,
        thumbnail: thumbnailPath,
        name,
        mimeType: 'video/mp4',
      }),
      Uploader.upload(thumbnail, {
        path: thumbnailPath,
        'x-amz-meta-mimeType': thumbnail.mimetype,
        'x-amz-meta-size': thumbnail.size.toString(),
      }),
    ]);

    return {
      attachment,
      link: s3PreSingedLink,
    };
  }

  static async sendUploadVideoMessage({ chatChannel, user, link }) {
    return ChatService.sendMessage('NEW_VIDEO', chatChannel, user, null, {
      link,
    });
  }

  static async sendMessage(commandName, chatChannel, user, messageId = null, data = {}) {
    const [chatMember, actor] = await Promise.all([
      ChatMember.findOne({
        where: {
          channelId: chatChannel.id,
          userId: user.id,
        },
      }),
      User.findByPk(user.id, {
        attributes: User.getAttributes(),
      }),
    ]);

    if (!chatMember) {
      throw new Error('MEMBER-0404');
    }

    const messageAttributes = {
      type: 'command',
      commandName,
      data,
      actor: actor.toChatActor(),
      isContinuing: data.isContinuing || false,
      is_expired: false,
    };

    /* eslint-disable no-undef */
    const message = __(get(commandMessage, commandName));
    const messageData = {
      from: chatMember.identity,
      channelSid: chatChannel.channelSid,
      type: 'action',
      body: message,
      attributes: JSON.stringify(objectToSnake(messageAttributes)),
    };
    let messageTwilio = null;

    if (messageId) {
      messageTwilio = await twilioClient.updateMessage(
        messageId,
        chatChannel.channelSid,
        messageData
      );
    } else {
      messageTwilio = await twilioClient.sendMessage(chatChannel.channelSid, messageData);
    }

    notificationQueue.add('chat_notification', {
      chatChannelId: chatChannel.id,
      actorId: user.id,
      message,
      commandName,
    });

    return messageTwilio;
  }

  /**
   * Approve estimation
   *
   * @param {*} param
   */
  static async approveEstimateTime({ chatChannel, user, data }) {
    const { messageSid } = data;
    const estimationMessage = await EstimationMessage.findByMessageSidOrFail(messageSid);

    const [supporterIds, userProfile] = await Promise.all([
      ChatMember.getSupporterIds(chatChannel.id),
      UserProfile.findOne({ where: { userId: user.id } }),
    ]);

    const estimationData = get(estimationMessage, 'data', {});
    const customerCost = get(estimationData, 'customer.cost', 0);
    const customerDiscount = get(estimationData, 'customer.discount', 0);
    const customerFee = get(estimationData, 'customer.fee', 0);
    const totalTime = get(estimationData, 'totalTime', 0);
    const timeUnit = get(estimationData, 'unitTime', unitTime.HOUR);

    const { issue } = chatChannel;

    if (
      issue.paymentMethod === paymentMethod.MOMO &&
      userProfile.accountBalance < customerCost + customerFee - customerDiscount
    ) {
      throw new Error('ISSUE-0411');
    }

    const receiveIssue = await ReceiveIssue.findBySupporterIds(chatChannel.issue.id, supporterIds);

    await Promise.all([
      receiveIssue.update({ status: issueStatus.IN_PROGRESS, time: totalTime, timeUnit }),
      chatChannel.issue.update({
        status: issueStatus.IN_PROGRESS,
      }),
      Issue.update(
        {
          status: issueStatus.IN_PROGRESS,
        },
        {
          where: {
            id: chatChannel.issue.id,
          },
        }
      ),
      estimationMessage.update({ status: estimationMessageStatus.APPROVED }),
    ]);

    set(estimationData, 'issue.status', receiveIssue.status);

    await this.sendMessage(
      command.APPROVAL_ESTIMATION_TIME,
      chatChannel,
      user,
      messageSid,
      estimationData
    );

    return receiveIssue;
  }

  /**
   * Approve material cost
   * @param {*} param
   */
  static async approveMaterialCost({ chatChannel, user, data }) {
    const { messageSid, materials } = data;
    data.totalCost = +sumBy(materials, (o) => o.cost);
    const estimationMessage = await EstimationMessage.findByMessageSidOrFail(messageSid);

    const isValid = isValidEstimation(data, estimationMessage, ['totalCost']);

    if (!isValid) {
      throw new Error('EST-0403');
    }

    const { issue } = chatChannel;

    const members = await ChatMember.findAll({
      where: {
        channelId: chatChannel.id,
        userId: {
          [Op.ne]: user.id,
        },
      },
    });

    const supporterIds = members.map((item) => item.userId);

    const receiveIssue = await ReceiveIssue.findBySupporterIds(issue.id, supporterIds);

    const supporterId = get(receiveIssue, 'userId');

    if (issue.paymentMethod === paymentMethod.MOMO) {
      const [customerProfile, estimate] = await Promise.all([
        UserProfile.findOne({
          where: {
            userId: user.id,
          },
        }),
        EstimationMessage.findByChannelIdAndStatusAndType(
          chatChannel.id,
          estimationMessageStatus.APPROVED,
          command.SUBMIT_ESTIMATION_TIME
        ),
      ]);

      const customerFee = get(estimate, 'customer.cost', 0);
      const discount = get(receiveIssue, 'customer.discount', 0);
      const totalCost = customerFee + data.totalCost - discount;
      if (customerProfile.accountBalance < totalCost) {
        throw new Error('ISSUE-0411');
      }
    }

    const issueMaterialData = materials.map((item) => ({
      id: uuidv4(),
      userId: supporterId,
      issueId: issue.id,
      cost: item.cost,
      material: item.material,
    }));

    set(data, 'issue.status', receiveIssue.status);

    await Promise.all([
      supporterId && !isEmpty(issueMaterialData)
        ? IssueMaterial.bulkCreate(issueMaterialData)
        : null,
      this.sendMessage(command.APPROVAL_MATERIAL_COST, chatChannel, user, data.messageSid, data),
      estimationMessage.update({ status: estimationMessageStatus.APPROVED }),
    ]);

    return receiveIssue;
  }

  static async trackingProgress({ chatChannel, user, data }) {
    const { attachmentIds, content = '', messageSid } = data;

    const { issue } = chatChannel;
    const [attachments, supporterIds] = await Promise.all([
      Attachment.findAll({
        where: {
          id: attachmentIds || [],
        },
        attributes: ['id', 'path', 'url', 'thumbnailPath', 'mimeType', 'name', 'thumbnail'],
        order: [['createdAt', 'ASC']],
      }),
      ChatMember.getSupporterIds(chatChannel.id),
      issue.addAttachments(attachmentIds),
    ]);

    const messageAttributes = {
      content,
      attachments: attachments.map((item) =>
        pick(item, ['id', 'url', 'thumbnailPath', 'mimeType', 'name'])
      ),
      issue: {
        status: issue.status,
      },
    };

    await this.sendMessage(
      command.UPDATED_PROGRESS,
      chatChannel,
      user,
      messageSid,
      messageAttributes
    );

    return ReceiveIssue.findBySupporterIds(issue.id, supporterIds);
  }

  static async finish({ chatChannel, user }) {
    const { issue } = chatChannel;

    const [supporterIds, acceptance] = await Promise.all([
      ChatMember.getSupporterIds(chatChannel.id),
      Acceptance.findOne({
        where: {
          channelId: chatChannel.id,
        },
      }),
    ]);

    const [receiveIssue, estimationMessage] = await Promise.all([
      ReceiveIssue.findBySupporterIds(issue.id, supporterIds),
      EstimationMessage.findByChannelIdAndStatusAndType(
        chatChannel.id,
        estimationMessageStatus.APPROVED,
        command.SUBMIT_ESTIMATION_TIME
      ),
    ]);

    if (isNil(receiveIssue) || isEmpty(estimationMessage)) {
      throw new Error('ISSUE-0412');
    }

    const acceptanceData = get(acceptance, 'data', {});
    const comment = get(acceptanceData, 'comment');
    const rate = get(acceptanceData, 'rate');

    await ChatService.finishIssue({
      receiveIssue,
      acceptanceData,
      issue,
    });

    await Promise.all([
      Issue.update(
        {
          status: issueStatus.DONE,
        },
        {
          where: {
            id: issue.id,
          },
        }
      ),
      receiveIssue.update({
        status: issueStatus.DONE,
        rating: get(acceptanceData, 'rate', 0),
        time: get(acceptanceData, 'totalTime', 0),
        customerFee: get(acceptanceData, 'totalAmount', 0),
        workerFee: get(acceptanceData, 'totalAmount', 0),
        discount: get(acceptanceData, 'customer.discount', 0),
      }),
      comment
        ? ReceiveIssueComment.create({
            userId: issue.createdBy,
            receiveIssueId: receiveIssue.id,
            content: comment,
          })
        : null,
      LatestIssueStatus.findOrCreate({
        issueId: issue.id,
        userId: issue.createdBy,
        status: issueStatus.DONE,
      }),
    ]);

    const event = issue.eventId
      ? await Event.findOne({
          where: {
            id: issue.eventId,
          },
        })
      : null;

    if (event && event.type === saleEventTypes.VOUCHER) {
      await UserEvent.update(
        {
          limit: 0,
        },
        {
          where: {
            userId: issue.createdBy,
            eventId: event.id,
          },
        }
      );
    }

    if (rate === 5) {
      await ChatService.checkSaleEvent({ receiveIssue, issue });
    }

    set(acceptanceData, 'issue.status', receiveIssue.status);

    await Promise.all([
      this.sendMessage(command.COMPLETED, chatChannel, user, acceptance.messageSid, acceptanceData),
      acceptance.update({
        data: acceptanceData,
        status: issueStatus.DONE,
      }),
      this.sendMessage(command.CONFIRMED_PAYMENT, chatChannel, user, null, acceptanceData),
    ]);

    return receiveIssue;
  }

  static async checkSaleEvent({ receiveIssue, issue }) {
    const events = await Event.findAll({
      where: {
        code: ['FIRST-5-STAR', 'NEXT-5-5-STAR'],
        status: eventStatuses.ACTIVE,
      },
    });

    const first5StarEvent = events.find((event) => event.code === 'FIRST-5-STAR');
    const next5StarEvent = events.find((event) => event.code === 'NEXT-5-5-STAR');
    const fiveStarQty = await ReceiveIssue.count({
      where: { userId: receiveIssue.userId, issueId: issue.id },
    });
    if (first5StarEvent && fiveStarQty === 1) {
      await UserProfile.update(
        {
          accountBalance: Sequelize.literal(`account_balance + ${first5StarEvent.value}`),
        },
        {
          where: {
            userId: receiveIssue.userId,
          },
        }
      );

      const transaction = await TransactionHistory.create({
        id: uuidv4(),
        userId: receiveIssue.userId,
        amount: first5StarEvent.value || 0,
        total: first5StarEvent.value || 0,
        discount: 0,
        issueId: issue.id,
        type: transactionType.BONUS,
        currency: currencies.VND,
        extra: {
          event: first5StarEvent.toJSON(),
        },
        actorId: issue.createdBy,
        method: paymentMethod.CASH,
      });

      notificationQueue.add('receive_bonus', {
        actorId: receiveIssue.userId,
        issue: issue.toJSON(),
        transaction: transaction.toJSON(),
      });
      return;
    }
    if (next5StarEvent && fiveStarQty === 6) {
      await UserProfile.update(
        {
          accountBalance: Sequelize.literal(`account_balance + ${next5StarEvent.value}`),
        },
        {
          where: {
            userId: receiveIssue.userId,
          },
        }
      );

      const transaction = await TransactionHistory.create({
        id: uuidv4(),
        userId: receiveIssue.userId,
        amount: next5StarEvent.value || 0,
        total: next5StarEvent.value || 0,
        discount: 0,
        issueId: issue.id,
        currency: currencies.VND,
        type: transactionType.BONUS,
        extra: {
          event: next5StarEvent.toJSON(),
        },
        actorId: issue.createdBy,
        method: paymentMethod.CASH,
      });

      notificationQueue.add('receive_bonus', {
        actorId: receiveIssue.userId,
        issue: issue.toJSON(),
        transaction: transaction.toJSON(),
      });
    }
  }

  static async continueChatting({ chatChannel, user, data }) {
    const { messageSid } = data;
    const [message, supporterIds] = await Promise.all([
      twilioClient.fetchMessage(messageSid, chatChannel.channelSid),
      ChatMember.getSupporterIds(chatChannel.id),
    ]);

    const attributes = JSON.parse(message.attributes);
    data = attributes.data || {};
    data.isContinuing = true;
    set(data, 'issue.status', chatChannel.issue.status);
    const receiveIssue = await ReceiveIssue.findBySupporterIds(chatChannel.issue.id, supporterIds);
    if (receiveIssue.status === issueStatus.WAITING_VERIFY) {
      Object.assign(receiveIssue, {
        status: issueStatus.IN_PROGRESS,
      });

      await Promise.all([
        receiveIssue.save(),
        Issue.update(
          {
            status: issueStatus.IN_PROGRESS,
          },
          {
            where: {
              id: chatChannel.issue.id,
            },
          }
        ),
      ]);
      set(data, 'issue.status', issueStatus.IN_PROGRESS);
    }

    await this.sendMessage(
      attributes.command_name || command.CONTINUE_CHATTING,
      chatChannel,
      user,
      messageSid,
      data
    );

    await EstimationMessage.update(
      { status: estimationMessageStatus.CANCELED },
      {
        where: {
          messageSid,
        },
      }
    );

    return receiveIssue;
  }

  static async addInformation({ chatChannel, user, data }) {
    const { attachmentIds, content = '', messageSid } = data;

    const { issue } = chatChannel;
    const [attachments, supporterIds] = await Promise.all([
      Attachment.findAll({
        where: {
          id: attachmentIds || [],
        },
        attributes: ['id', 'path', 'url', 'thumbnail', 'thumbnailPath', 'mimeType', 'name'],
        order: [['createdAt', 'ASC']],
      }),
      ChatMember.getSupporterIds(chatChannel.id),
      issue.addAttachments(attachmentIds),
    ]);

    const messageAttributes = {
      content,
      attachments: attachments.map((item) =>
        pick(item, ['id', 'url', 'thumbnailPath', 'mimeType', 'name'])
      ),
      issue: {
        status: chatChannel.issue.status,
      },
    };

    await this.sendMessage(
      command.ADDED_MORE_INFORMATION,
      chatChannel,
      user,
      messageSid,
      messageAttributes
    );

    return ReceiveIssue.findBySupporterIds(chatChannel.issue.id, supporterIds);
  }

  static async finishIssue({ receiveIssue, acceptanceData, issue }) {
    const { issueId } = receiveIssue;
    const method = get(issue, 'method');
    const workerId = get(receiveIssue, 'userId');
    const customerId = get(issue, 'createdBy');

    const extra = {
      workingTimes: get(acceptanceData, 'workingTimes', []),
      totalTime: get(acceptanceData, 'totalTime', 0),
      unitTime: get(acceptanceData, 'unitTime', 0),
    };
    const totalAmount = get(acceptanceData, 'totalAmount', 0);
    const rate = get(acceptanceData, 'rate', 0);
    const amountIntoWalletCustomer = get(acceptanceData, 'customer.amountIntoWallet', 0);
    const amountIntoWalletWorker = get(acceptanceData, 'worker.amountIntoWallet', 0);

    const transactionHistories = [
      {
        id: uuidv4(),
        userId: workerId,
        amount: totalAmount,
        discount: get(acceptanceData, 'worker.discount', 0),
        total: totalAmount,
        issueId,
        type: transactionType.WAGE,
        extra,
        actorId: customerId,
        method,
      },
      {
        id: uuidv4(),
        userId: customerId,
        amount: totalAmount,
        total: totalAmount,
        discount: get(acceptanceData, 'customer.discount', 0),
        issueId,
        type: transactionType.PAY,
        extra,
        actorId: workerId,
        method,
      },
    ];

    await sequelize.transaction(async (t) => {
      return Promise.all([
        UserProfile.update(
          {
            accountBalance:
              method === paymentMethod.MOMO
                ? Sequelize.literal(`account_balance + ${totalAmount + amountIntoWalletWorker}`)
                : Sequelize.literal(`account_balance + ${amountIntoWalletWorker}`),
            totalIssueCompleted: Sequelize.literal(`total_issue_completed + 1`),
            totalRating: Sequelize.literal(`total_rating + ${rate}`),
            reliability: Sequelize.literal(
              `(total_rating + ${rate}) / (total_issue_completed + 1)`
            ),
          },
          {
            where: {
              userId: workerId,
            },
            transaction: t,
          }
        ),
        method === paymentMethod.MOMO
          ? UserProfile.update(
              {
                accountBalance: Sequelize.literal(
                  `account_balance - ${totalAmount + amountIntoWalletCustomer}`
                ),
              },
              {
                where: {
                  userId: customerId,
                },
                transaction: t,
              }
            )
          : null,
        TransactionHistory.bulkCreate(transactionHistories, {
          transaction: t,
        }),
      ]);
    });
  }

  static async joinChat(user, { issueId }) {
    const [issue, receiveIssue] = await Promise.all([
      Issue.findByPk(issueId, {
        include: [
          {
            model: User,
            require: true,
            as: 'creator',
          },
        ],
      }),
      ReceiveIssue.findOne({
        where: {
          issueId,
          status: {
            [Op.ne]: issueStatus.CANCELLED,
          },
        },
      }),
    ]);
    const customerId = get(issue, 'createdBy');
    const host = get(issue, 'creator');

    let chatChannel = await ChatChannel.findChannelGroup(issueId, [customerId, user.id]);

    if (!chatChannel) {
      chatChannel = await ChatChannel.findChannelGroup(issueId, [
        customerId,
        get(receiveIssue, 'userId', ''),
      ]);
    }

    if (isNil(chatChannel)) {
      throw new Error('CHAT-0404');
    }

    const [authorChat, supporting, worker] = await Promise.all([
      this.addUserToChat(chatChannel, user),
      User.findByPk(user.id, {
        attributes: User.getAttributes(),
      }),
      User.findByPk(receiveIssue.userId, {
        attributes: User.getAttributes(),
      }),
    ]);

    const allowAttributes = ['id', 'avatar', 'name', 'status'];
    authorChat.setDataValue('supporting', pick(supporting.toJSON(), allowAttributes));
    authorChat.setDataValue('worker', pick(worker.toJSON(), allowAttributes));
    authorChat.setDataValue('host', pick(host.toJSON(), allowAttributes));

    const twilioToken = await twilioClient.getAccessToken(authorChat.identity);
    authorChat.setDataValue('token', twilioToken);

    return authorChat;
  }

  static async handleWebhook({ channelSid, clientIdentity, message }) {
    const [chatChannel, chatMember] = await Promise.all([
      ChatChannel.findOne({
        where: {
          channelSid,
        },
        include: [
          {
            model: Issue,
            require: true,
          },
        ],
      }),
      ChatMember.findOne({
        where: {
          channelSid,
          identity: clientIdentity,
        },
      }),
    ]);

    const { issue } = chatChannel;

    if (issue) {
      await Promise.all([
        Issue.update(
          {
            msgAt: new Date(),
          },
          { where: { id: issue.id } }
        ),
        LatestIssueStatus.upsert({
          id: uuid(),
          issueId: issue.id,
          userId: issue.createdBy,
          status: issueStatus.CHATTING,
        }),
      ]);
    }

    notificationQueue.add('chat_notification', {
      chatChannelId: chatChannel.id,
      actorId: get(chatMember, 'userId'),
      message,
      commandName: 'NEW_MESSAGE',
    });
  }

  static async addPromotion({ user, chatChannel, attachmentIds }) {
    const { issue } = chatChannel;
    const [attachments] = await Promise.all([
      Attachment.findAll({
        where: {
          id: attachmentIds || [],
        },
        attributes: ['id', 'url', 'thumbnail', 'thumbnailPath', 'mimeType', 'name', 'path'],
        order: [['createdAt', 'ASC']],
      }),
      issue.addAttachments(attachmentIds),
    ]);

    const promotions = attachments.map((item) => ({
      path: item.url,
      mimeType: item.mimeType,
      thumbnailPath: item.thumbnailPath,
      name: item.name,
    }));

    const messageAttributes = {
      promotions,
    };

    await this.sendMessage(command.ADDED_PROMOTION, chatChannel, user, null, messageAttributes);
  }

  /**
   * Send welcome Message
   *
   * @param {ChatChannel} chatChannel
   * @param {Member} memberChat
   * @param {User} worker
   */
  static async sendWelcomeMessage(chatChannel, memberChat, worker) {
    const requestSupporting = await RequestSupporting.findOne({
      where: {
        userId: memberChat.userId,
        issueId: chatChannel.issueId,
      },
    });
    const message = get(requestSupporting, 'message');

    if (!isEmpty(message)) {
      const messageAttributes = {
        type: 'message',
        actor: worker.toJSON(),
      };

      const messageData = {
        from: memberChat.identity,
        channelSid: chatChannel.channelSid,
        body: message,
        attributes: JSON.stringify(objectToSnake(messageAttributes)),
      };

      await twilioClient.sendMessage(chatChannel.channelSid, messageData);
    }
  }

  static async acceptPayment({ chatChannel, user, data }) {
    const { issue } = chatChannel;
    const { rate, comment = '', messageSid } = data;

    const [supporterIds, acceptance] = await Promise.all([
      ChatMember.getSupporterIds(chatChannel.id),
      Acceptance.findOne({
        where: {
          channelId: chatChannel.id,
        },
      }),
    ]);

    const [receiveIssue, estimationMessage] = await Promise.all([
      ReceiveIssue.findBySupporterIds(issue.id, supporterIds),
      EstimationMessage.findByChannelIdAndStatusAndType(
        chatChannel.id,
        estimationMessageStatus.APPROVED,
        command.SUBMIT_ESTIMATION_TIME
      ),
    ]);

    if (isNil(receiveIssue) || isEmpty(estimationMessage)) {
      throw new Error('ISSUE-0412');
    }

    await Promise.all([
      Issue.update(
        {
          status: issueStatus.WAITING_PAYMENT,
        },
        {
          where: {
            id: issue.id,
          },
        }
      ),
      receiveIssue.update({
        status: issueStatus.WAITING_PAYMENT,
      }),
    ]);

    const acceptanceData = get(acceptance, 'data', {});
    set(acceptanceData, 'rate', rate);
    set(acceptanceData, 'comment', comment);
    set(acceptanceData, 'issue.status', issueStatus.WAITING_PAYMENT);

    await Promise.all([
      this.sendMessage(command.ACCEPTANCE, chatChannel, user, messageSid, acceptanceData),
      acceptance.update({
        data: acceptanceData,
        status: issueStatus.WAITING_PAYMENT,
      }),
    ]);

    return receiveIssue;
  }

  static async requestAcceptance(chatChannel, user) {
    const supporterIds = await ChatMember.getSupporterIds(chatChannel.id);
    const { issue } = chatChannel;

    const [receiveIssue, waitingEstimationMessage, estimationMessage, survey] = await Promise.all([
      ReceiveIssue.findBySupporterIds(issue.id, supporterIds),
      EstimationMessage.findByWaitingStatus(chatChannel.id),
      EstimationMessage.findByChannelIdAndStatusAndType(
        chatChannel.id,
        estimationMessageStatus.APPROVED,
        command.SUBMIT_ESTIMATION_TIME
      ),
      Survey.findOne({
        where: {
          channelId: chatChannel.id,
          status: issueStatus.APPROVAL,
        },
      }),
    ]);

    if (isNil(receiveIssue) || isEmpty(estimationMessage)) {
      throw new Error('ISSUE-0412');
    }

    if (!isNil(waitingEstimationMessage)) {
      throw new Error('ISSUE-0413');
    }

    Object.assign(receiveIssue, {
      status: issueStatus.WAITING_VERIFY,
    });

    const [data] = await Promise.all([
      getIssueCost(receiveIssue, estimationMessage, survey),
      receiveIssue.save(),
      Issue.update(
        {
          status: issueStatus.WAITING_VERIFY,
        },
        {
          where: {
            id: issue.id,
          },
        }
      ),
    ]);

    set(data, 'issue.status', get(receiveIssue, 'status', get(issue, 'status')));

    const message = await this.sendMessage(
      command.REQUEST_ACCEPTANCE,
      chatChannel,
      user,
      null,
      data
    );
    await Acceptance.updateOrCreate(
      {
        receiveIssueId: receiveIssue.id,
      },
      {
        messageSid: message.sid,
        channelId: chatChannel.id,
        status: issueStatus.WAITING_VERIFY,
        data: pick(data, EstimationMessage.baseAttributeOnData()),
      }
    );

    return receiveIssue;
  }

  static async requestConfirmPayment(chatChannel, user) {
    const { issue } = chatChannel;
    const acceptance = await Acceptance.findOne({
      where: {
        channelId: chatChannel.id,
      },
    });

    const acceptanceData = get(acceptance, 'data', {});
    set(acceptanceData, 'issue.status', get(issue, 'status'));
    await this.sendMessage(
      command.REQUEST_CONFIRM_PAYMENT,
      chatChannel,
      user,
      null,
      acceptanceData
    );
  }

  static async joinChatHistory(user, issueId) {
    const [issue, receiveIssue] = await Promise.all([
      Issue.findOne({
        where: {
          id: issueId,
          status: issueStatus.DONE,
        },
      }),
      ReceiveIssue.findOne({
        where: {
          issueId,
          status: issueStatus.DONE,
        },
      }),
    ]);

    if (isEmpty(receiveIssue) || isEmpty(issue)) {
      throw new Error('ISSU-0001');
    }

    const userIds = [receiveIssue.userId, issue.createdBy];

    if (!userIds.includes(user.id)) {
      throw new Error('ERR-0403');
    }

    const memberId = user.id === receiveIssue.userId ? issue.createdBy : receiveIssue.userId;

    const [chatChannel, member] = await Promise.all([
      ChatChannel.findChannelGroup(issueId, userIds),
      User.findByPk(memberId),
    ]);

    if (isNil(chatChannel)) {
      throw new Error('CHAT-0404');
    }

    const authorChat = await this.addUserToChat(chatChannel, user);
    const twilioToken = await twilioClient.getAccessToken(authorChat.identity);
    authorChat.setDataValue('token', twilioToken);
    authorChat.setDataValue('member', member.toChatActor());

    return authorChat;
  }

  static async survey({ user, chatChannel, data }) {
    const { issue } = chatChannel;
    const categories = await CategoryIssue.findAll({
      where: {
        issueId: issue.id,
      },
    });
    const categoriesId = categories.map((item) => item.categoryId);

    const [surveys, feeConfiguration, feeCategory] = await Promise.all([
      Survey.findAll({
        channelId: chatChannel.id,
        status: issueStatus.OPEN,
      }),
      FeeConfiguration.findOne({}),
      FeeCategory.findOne({
        where: {
          categoryId: categoriesId,
        },
        order: [['max', 'DESC']],
      }),
    ]);

    surveys.forEach((item) => {
      chatMessageQueue.add('update_message', {
        sid: item.messageSid,
        attributes: {
          is_expired: true,
        },
        channelSid: chatChannel.channelSid,
      });
    });

    const surveyCost = FeeFactory.getSurveyCost(issueType.HOTFIX, get(data, 'totalTime', 0) / 60, {
      classFee: feeCategory,
      configuration: feeConfiguration,
    });

    set(data, 'surveyFee', surveyCost);

    const message = await this.sendMessage(command.REQUEST_SURVEY, chatChannel, user, null, data);

    await Survey.updateOrCreate(
      {
        userId: user.id,
        channelId: chatChannel.id,
      },
      {
        messageSid: message.sid,
        channelId: chatChannel.id,
        status: issueStatus.OPEN,
        data,
        issueId: issue.id,
      }
    );
  }

  static async approveSurvey({ user, chatChannel, data }) {
    const { messageSid } = data;
    const survey = await Survey.findOne({
      where: {
        messageSid,
      },
    });

    if (!survey) {
      throw new Error('SURVEY-0404');
    }

    await this.sendMessage(
      command.APPROVAL_REQUEST_SURVEY,
      chatChannel,
      user,
      messageSid,
      get(survey, 'data', {})
    );

    await survey.update({ status: issueStatus.APPROVAL });
  }
}
