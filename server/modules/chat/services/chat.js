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
  unitTime,
  estimationMessageStatus,
} from '../../../constants';
import { objectToSnake } from '../../../helpers/Util';
import { notificationQueue } from '../../../helpers/Queue';
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
import { fileSystemConfig } from '../../../config';
import RequestSupporting from '../../../models/requestSupporting';
import IssueEstimation from '../../../models/issueEstimation';

const uploadPromotion = async (file) => {
  const id = uuidv4();
  const fileName = `${id}-${file.originalname}`;
  // eslint-disable-next-line no-use-before-define
  const path = `${ChatService.filePath}/${fileName}`;

  await Uploader.upload(file, {
    path,
    'x-amz-meta-mimeType': file.mimetype,
    'x-amz-meta-size': file.size.toString(),
  });

  return { path: `${fileSystemConfig.clout_front}/${path}` };
};

const getIssueCost = async (receiveIssue) => {
  const { issueId, id } = receiveIssue;

  const [materials, issueEstimation] = await Promise.all([
    IssueMaterial.findAll({
      where: {
        issueId,
      },
    }),
    IssueEstimation.findOne({
      where: {
        receiveIssueId: id,
      },
    }),
  ]);

  const {
    workingTimes,
    numOfWorker = 0,
    customerFee = 0,
    workerFee = 0,
    unit = unitTime.HOUR,
    discount = 0,
    totalTime = 0,
  } = issueEstimation;

  const [materialsCost] = await Promise.all([
    materials.map((item) => ({
      cost: item.cost,
      material: item.material,
    })),
  ]);

  return {
    fee: {
      customerFee: +customerFee,
      workerFee: +workerFee,
      discount: +discount,
    },
    unit,
    totalTime: +totalTime,
    workingTimes,
    numOfWorker: +numOfWorker,
    materials: materialsCost,
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

  static async create(user, data) {
    const { userId, issueId } = data;
    /* eslint-disable prefer-const */
    let [chatChannel, worker, issue] = await Promise.all([
      ChatChannel.findChannelGroup(issueId, [userId, user.id]),
      User.findByPk(userId, {
        attributes: User.getAttributes(),
      }),
      Issue.findByPk(issueId, {
        include: [
          {
            model: User,
            require: true,
            as: 'creator',
          },
        ],
      }),
    ]);
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
    const { issue } = chatChannel;

    let data = {};
    set(data, 'issue.status', issue.status);

    if (type === command.REQUEST_ACCEPTANCE) {
      const [receiveIssue, estimationMessage] = await Promise.all([
        ReceiveIssue.findByIssueIdAndUserIdsAndCheckHasEstimation(issue.id, supporterIds),
        EstimationMessage.findByChannelIdAndStatus(chatChannel.id, estimationMessageStatus.WAITING),
      ]);

      if (!isNil(estimationMessage)) {
        throw new Error('ISSUE-0413');
      }

      Object.assign(receiveIssue, {
        status: issueStatus.WAITING_VERIFY,
      });

      [data] = await Promise.all([
        getIssueCost(receiveIssue),
        receiveIssue.save(),
        Issue.update(
          {
            status: issueStatus.WAITING_VERIFY,
          },
          {
            where: {
              id: chatChannel.issue.id,
            },
          }
        ),
      ]);
      set(data, 'issue.status', issueStatus.WAITING_VERIFY);
    }

    await this.sendMessage(type, chatChannel, user, null, data);

    return ReceiveIssue.findBySupporterIds(chatChannel.issue.id, supporterIds);
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
      actor: actor.toJSON(),
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

    if (messageId) {
      await twilioClient.updateMessage(messageId, chatChannel.channelSid, messageData);
    } else {
      await twilioClient.sendMessage(chatChannel.channelSid, messageData);
    }

    notificationQueue.add('chat_notification', {
      chatChannelId: chatChannel.id,
      actorId: user.id,
      message,
      commandName,
    });
  }

  /**
   * Approve estimation
   *
   * @param {*} param
   */
  static async approveEstimateTime({ chatChannel, user, data }) {
    const { messageSid } = data;
    const estimationMessage = await EstimationMessage.findByMessageSidOrFail(messageSid);
    const isValid = isValidEstimation(data, estimationMessage, [
      'workerFee',
      'customerFee',
      'discount',
      'numOfWorker',
      'totalTime',
    ]);

    if (!isValid) {
      throw new Error('EST-0403');
    }

    const [supporterIds, userProfile] = await Promise.all([
      ChatMember.getSupporterIds(chatChannel.id),
      UserProfile.findOne({ where: { userId: user.id } }),
    ]);

    data.totalTime = +data.totalTime;
    data.workerFee = +data.workerFee;
    data.customerFee = +data.customerFee;
    data.numOfWorker = +data.numOfWorker;
    data.discount = +data.discount;
    const {
      workerFee,
      customerFee,
      numOfWorker,
      totalTime,
      unitTime: unit,
      type,
      discount,
      workingTimes,
    } = data;
    const { issue } = chatChannel;

    if (
      issue.paymentMethod === paymentMethod.MOMO &&
      userProfile.accountBalance < customerFee - discount
    ) {
      throw new Error('ISSUE-0411');
    }

    const receiveIssue = await ReceiveIssue.findBySupporterIds(chatChannel.issue.id, supporterIds);

    await Promise.all([
      receiveIssue.update({ status: issueStatus.IN_PROGRESS }),
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
      IssueEstimation.create({
        receiveIssueId: receiveIssue.id,
        totalTime,
        unitTime: unit,
        numOfWorker,
        workerFee,
        customerFee,
        discount,
        type,
        workingTimes,
      }),
      estimationMessage.update({ status: estimationMessageStatus.APPROVED }),
    ]);

    data.fee = {
      workerFee,
      customerFee,
      discount,
    };
    delete data.workerFee;
    delete data.customerFee;
    delete data.discount;
    set(data, 'issue.status', receiveIssue.status);

    await this.sendMessage(
      command.APPROVAL_ESTIMATION_TIME,
      chatChannel,
      user,
      data.messageSid,
      data
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
      const [customerProfile] = await Promise.all([
        UserProfile.findOne({
          where: {
            userId: user.id,
          },
        }),
      ]);

      const customerFee = get(receiveIssue, 'customerFee', 0);
      const discount = get(receiveIssue, 'discount', 0);
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

  static async trakingProgress({ chatChannel, user, data }) {
    const { attachmentIds, content = '', messageSid } = data;

    const { issue } = chatChannel;
    const [attachments, supporterIds] = await Promise.all([
      Attachment.findAll({
        where: {
          id: attachmentIds || [],
        },
        attributes: ['id', Attachment.buildUrlAttribuiteSelect()],
        raw: true,
      }),
      ChatMember.getSupporterIds(chatChannel.id),
      issue.addAttachments(attachmentIds),
    ]);

    const messageAttributes = {
      content,
      attachments,
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

  static async setRating({ chatChannel, user, data }) {
    const { issue } = chatChannel;
    const { rate, comment = '', messageSid } = data;

    const supporterIds = await ChatMember.getSupporterIds(chatChannel.id);

    const receiveIssue = await ReceiveIssue.findByIssueIdAndUserIdsAndCheckHasEstimation(
      issue.id,
      supporterIds
    );

    const { totalTime, customerFee, workerFee, discount } = await ChatService.finishIssue({
      user,
      receiveIssue,
      rate,
      method: issue.paymentMethod,
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
        rating: rate,
        time: totalTime,
        customerFee,
        workerFee,
        discount,
      }),
      comment
        ? ReceiveIssueComment.create({
            userId: user.id,
            receiveIssueId: receiveIssue.id,
            content: comment,
          })
        : null,
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
            userId: user.id,
            eventId: event.id,
          },
        }
      );
    }

    if (rate === 5) {
      await ChatService.checkSaleEvent({ user, receiveIssue, issue });
    }

    set(data, 'issue.status', receiveIssue.status);
    await this.sendMessage(command.ACCEPTANCE, chatChannel, user, messageSid, data);

    return receiveIssue;
  }

  static async checkSaleEvent({ user, receiveIssue, issue }) {
    const events = await Event.findAll({
      where: {
        code: ['FIRST-5-STAR', 'NEXT-5-5-STAR'],
        status: eventStatuses.ACTIVE,
      },
    });

    const userEvents = await UserEvent.findAll({
      where: {
        userId: receiveIssue.userId,
        eventId: events.map((event) => event.id),
      },
    });

    const first5StarEvent = events.find((event) => event.code === 'FIRST-5-STAR');
    const firstUserEvent = userEvents.find(
      (userEvent) => first5StarEvent && userEvent.eventId === first5StarEvent.id
    );
    const next5StarEvent = events.find((event) => event.code === 'NEXT-5-5-STAR');
    const next5UserEvent = userEvents.find(
      (userEvent) => next5StarEvent && userEvent.eventId === next5StarEvent.id
    );

    if (first5StarEvent && !firstUserEvent) {
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
      await UserEvent.create({
        userId: receiveIssue.userId,
        eventId: first5StarEvent.id,
        limit: 0,
      });
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
        actorId: user.id,
        method: paymentMethod.CASH,
      });

      notificationQueue.add('receive_bonus', {
        actorId: receiveIssue.userId,
        issue: issue.toJSON(),
        transaction: transaction.toJSON(),
      });
      return;
    }
    if (next5StarEvent) {
      if (!next5UserEvent) {
        await UserEvent.create({
          userId: receiveIssue.userId,
          eventId: first5StarEvent.id,
          limit: 5,
        });
        return;
      }
      if (next5UserEvent.limit === 0) {
        return;
      }
      if (next5UserEvent.limit > 1) {
        await next5UserEvent.update({
          limit: next5UserEvent.limit - 1,
        });
        return;
      }
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

      await next5UserEvent.update({
        limit: 0,
      });

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
        actorId: user.id,
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
        attributes: ['id', Attachment.buildUrlAttribuiteSelect()],
        raw: true,
      }),
      ChatMember.getSupporterIds(chatChannel.id),
      issue.addAttachments(attachmentIds),
    ]);

    const messageAttributes = {
      content,
      attachments,
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

  static async finishIssue({ user, receiveIssue, rate, method }) {
    const { issueId, issue_estimations: issueEstimations = [] } = receiveIssue;
    let customerFee = 0;
    let workerFee = 0;
    let discount = 0;
    const workingTimes = [];
    let totalTime = 0;
    let unit = unitTime.HOUR;

    await issueEstimations.forEach((item) => {
      customerFee += item.customerFee;
      workerFee += item.workerFee;
      discount += item.discount || 0;
      workingTimes.push(...item.workingTimes);
      totalTime += item.totalTime;
      unit = item.unitTime;
    });

    const extra = {
      workingTimes,
      totalTime,
      unitTime: unit,
    };
    const sumCost = await IssueMaterial.sumCost(issueId, receiveIssue.userId);

    const total = customerFee + sumCost - discount;

    const transactionHistories = [
      {
        id: uuidv4(),
        userId: receiveIssue.userId,
        amount: customerFee + sumCost,
        discount,
        total,
        issueId,
        type: transactionType.WAGE,
        extra: {
          ...extra,
          systemFee: customerFee - workerFee,
        },
        actorId: user.id,
        method,
      },
      {
        id: uuidv4(),
        userId: user.id,
        amount: workerFee + sumCost,
        issueId,
        type: transactionType.PAY,
        extra,
        actorId: receiveIssue.userId,
        method,
      },
    ];

    await sequelize.transaction(async (t) => {
      return Promise.all([
        UserProfile.update(
          {
            accountBalance:
              method === paymentMethod.MOMO
                ? Sequelize.literal(`account_balance + ${workerFee + sumCost}`)
                : Sequelize.literal(`account_balance - ${customerFee - workerFee}`),
            totalIssueCompleted: Sequelize.literal(`total_issue_completed + 1`),
            totalRating: Sequelize.literal(`total_rating + ${rate}`),
            reliability: Sequelize.literal(
              `(total_rating + ${rate}) / (total_issue_completed + 1)`
            ),
          },
          {
            where: {
              userId: receiveIssue.userId,
            },
            transaction: t,
          }
        ),
        method === paymentMethod.MOMO
          ? UserProfile.update(
              {
                accountBalance: Sequelize.literal(`account_balance - ${total}`),
              },
              {
                where: {
                  userId: user.id,
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

    return {
      totalTime,
      customerFee,
      workerFee,
      discount,
    };
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
      }),
      ChatMember.findOne({
        where: {
          channelSid,
          identity: clientIdentity,
        },
      }),
    ]);

    if (chatChannel) {
      await Issue.update(
        {
          msgAt: new Date(),
        },
        { where: { id: chatChannel.issueId } }
      );
    }

    notificationQueue.add('chat_notification', {
      chatChannelId: chatChannel.id,
      actorId: get(chatMember, 'userId'),
      message,
      commandName: 'NEW_MESSAGE',
    });
  }

  static async addPromotion({ user, files = [], chatChannel }) {
    const promises = files.map((file) => uploadPromotion(file));

    const promotions = await Promise.all(promises);
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
}
