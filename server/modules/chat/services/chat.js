import uuid, { v4 as uuidv4 } from 'uuid';
import Sequelize, { Op } from 'sequelize';
import { get, isNil, pick, isEmpty } from 'lodash';

import ChatMember from '../../../models/chatMember';
import { twilioClient } from '../../../helpers/Twilio';
import ChatChannel from '../../../models/chatChannel';
import User from '../../../models/user';
import ChatUser from '../../../models/chatUser';
import ReceiveIssue from '../../../models/receiveIssue';
import {
  commandMessage,
  issueStatus,
  command,
  transactionType,
  paymentMethod,
} from '../../../constants';
import { objectToSnake } from '../../../helpers/Util';
import { notificationQueue } from '../../../helpers/Queue';
import Issue from '../../../models/issue';
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
      await this.sendWelcomeMessage(chatChannel, workerChat);
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

    return ChatMember.addMember({
      identity: chatUser.identity,
      channelSid: chatChannel.channelSid,
      friendlyName: user.name,
      serviceSid: chatChannel.serviceSid,
      roleSid: chatUser.roleSid,
      userId: user.id,
      channelId: chatChannel.id,
      memberSid: twilioMember.sid,
    });
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
    const members = await ChatMember.findAll({
      where: {
        channelId: chatChannel.id,
      },
    });
    const supporterIds = members.map((item) => item.userId);

    if (type === command.REQUEST_ACCEPTANCE) {
      const { issue } = chatChannel;
      await ReceiveIssue.findByIssueIdAndUserIdsAndCheckHasEstimation(issue.id, supporterIds);

      await Promise.all([
        ReceiveIssue.update(
          {
            status: issueStatus.WAITING_VERIFY,
          },
          {
            where: {
              issueId: chatChannel.issue.id,
            },
          }
        ),
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
    }

    await this.sendMessage(type, chatChannel, user);
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
    await EstimationMessage.findByMessageSidOrFail(messageSid);
    const [chatMembers, userProfile] = await Promise.all([
      ChatMember.findAll({
        where: {
          channelId: chatChannel.id,
        },
      }),
      UserProfile.findOne({ where: { userId: user.id } }),
    ]);

    const supporterIds = chatMembers.map((item) => item.userId);

    data.totalTime = +data.totalTime;
    data.workerFee = +data.workerFee;
    data.customerFee = +data.customerFee;
    const { startTime, endTime, workerFee, customerFee } = data;
    const { issue } = chatChannel;

    if (issue.paymentMethod === paymentMethod.MOMO && userProfile.accountBalance < customerFee) {
      throw new Error('ISSUE-0411');
    }

    await Promise.all([
      ReceiveIssue.update(
        {
          time: data.totalTime,
          startTime,
          endTime,
          workerFee,
          customerFee,
          status: issueStatus.IN_PROGRESS,
        },
        {
          where: {
            issueId: chatChannel.issue.id,
            userId: supporterIds,
          },
        }
      ),
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
    ]);

    data.fee = {
      workerFee,
      customerFee,
    };
    delete data.workerFee;
    delete data.customerFee;
    await this.sendMessage(
      command.APPROVAL_ESTIMATION_TIME,
      chatChannel,
      user,
      data.messageSid,
      data
    );
  }

  /**
   * Approve material cost
   * @param {*} param
   */
  static async approveMaterialCost({ chatChannel, user, data }) {
    const { messageSid } = data;
    await EstimationMessage.findByMessageSidOrFail(messageSid);
    data.totalCost = +data.totalCost;
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
    let supporterId = null;

    if (issue.paymentMethod === paymentMethod.MOMO) {
      const [customerProfile, receiveIssue] = await Promise.all([
        UserProfile.findOne({
          where: {
            userId: user.id,
          },
        }),
        ReceiveIssue.findOne({
          where: {
            issueId: issue.id,
            userId: supporterIds,
          },
        }),
      ]);

      const customerFee = get(receiveIssue, 'customerFee', 0);
      supporterId = get(receiveIssue, 'userId');
      if (customerProfile.accountBalance < customerFee + data.totalCost) {
        throw new Error('ISSUE-0411');
      }
    }

    await Promise.all([
      supporterId
        ? IssueMaterial.create({
            userId: supporterId,
            issueId: issue.id,
            cost: data.totalCost,
            material: data.materials,
          })
        : null,
      this.sendMessage(command.APPROVAL_MATERIAL_COST, chatChannel, user, data.messageSid, data),
    ]);
  }

  static async trakingProgress({ chatChannel, user, data }) {
    const { attachmentIds, content = '', messageSid } = data;

    const { issue } = chatChannel;
    const [attachments] = await Promise.all([
      Attachment.findAll({
        where: {
          id: attachmentIds || [],
        },
        attributes: ['id', Attachment.buildUrlAttribuiteSelect()],
        raw: true,
      }),
      issue.addAttachments(attachmentIds),
    ]);

    const messageAttributes = {
      content,
      attachments,
    };
    await this.sendMessage(
      command.UPDATED_PROGRESS,
      chatChannel,
      user,
      messageSid,
      messageAttributes
    );
  }

  static async setRating({ chatChannel, user, data }) {
    const { issue } = chatChannel;
    const { rate, comment = '', messageSid } = data;

    const members = await ChatMember.findAll({
      where: {
        channelId: chatChannel.id,
      },
    });
    const supporterIds = members.map((item) => item.userId);

    const receiveIssue = await ReceiveIssue.findByIssueIdAndUserIdsAndCheckHasEstimation(
      issue.id,
      supporterIds
    );

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
      }),
      comment
        ? ReceiveIssueComment.create({
            userId: user.id,
            receiveIssueId: receiveIssue.id,
            content: comment,
          })
        : null,
      issue.paymentMethod !== paymentMethod.CASH
        ? ChatService.finishIssue({ user, receiveIssue, rate })
        : null,
    ]);
    await this.sendMessage(command.ACCEPTANCE, chatChannel, user, messageSid, data);
  }

  static async continueChatting({ chatChannel, user, data }) {
    const { messageSid } = data;
    const message = await twilioClient.fetchMessage(messageSid, chatChannel.channelSid);
    const attributes = JSON.parse(message.attributes);
    data = attributes.data || {};
    data.isContinuing = true;
    await this.sendMessage(
      attributes.command_name || command.CONTINUE_CHATTING,
      chatChannel,
      user,
      messageSid,
      data
    );
  }

  static async addInformation({ chatChannel, user, data }) {
    const { attachmentIds, content = '', messageSid } = data;

    const { issue } = chatChannel;
    const [attachments] = await Promise.all([
      Attachment.findAll({
        where: {
          id: attachmentIds || [],
        },
        attributes: ['id', Attachment.buildUrlAttribuiteSelect()],
        raw: true,
      }),
      issue.addAttachments(attachmentIds),
    ]);

    const messageAttributes = {
      content,
      attachments,
    };
    await this.sendMessage(
      command.ADDED_MORE_INFORMATION,
      chatChannel,
      user,
      messageSid,
      messageAttributes
    );
  }

  static async finishIssue({ user, receiveIssue, rate }) {
    const { workerFee, customerFee, issueId, startTime, endTime, time } = receiveIssue;
    const extra = {
      startTime,
      endTime,
      totalTime: time,
    };
    const sumCost = await IssueMaterial.sumCost(issueId, receiveIssue.userId);

    const transactionHistories = [
      {
        id: uuidv4(),
        userId: receiveIssue.userId,
        amount: customerFee + sumCost,
        issueId,
        type: transactionType.WAGE,
        extra,
        actorId: user.id,
      },
      {
        id: uuidv4(),
        userId: user.id,
        amount: workerFee + sumCost,
        issueId,
        type: transactionType.PAY,
        extra,
        actorId: receiveIssue.userId,
      },
    ];

    return sequelize.transaction(async (t) => {
      return Promise.all([
        UserProfile.update(
          {
            accountBalance: Sequelize.literal(`account_balance + ${customerFee + sumCost}`),
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
        UserProfile.update(
          {
            accountBalance: Sequelize.literal(`account_balance - ${workerFee + sumCost}`),
          },
          {
            where: {
              userId: user.id,
            },
            transaction: t,
          }
        ),
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
      chatChannel = await ChatChannel.findChannelGroup(issueId, [customerId, receiveIssue.userId]);
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
   * @param {Member} worker
   */
  static async sendWelcomeMessage(chatChannel, worker) {
    const requestSupporting = await RequestSupporting.findOne({
      where: {
        userId: worker.userId,
        issueId: chatChannel.issueId,
      },
    });
    const message = get(requestSupporting, 'message');

    if (!isEmpty(message)) {
      const messageData = {
        from: worker.identity,
        channelSid: chatChannel.channelSid,
        body: message,
      };

      await twilioClient.sendMessage(chatChannel.channelSid, messageData);
    }
  }
}
