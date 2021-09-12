import uuid, { v4 as uuidv4 } from 'uuid';
import Sequelize, { Op } from 'sequelize';
import { get } from 'lodash';

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

export default class ChatService {
  static async create(user, data) {
    const { userId, issueId } = data;
    /* eslint-disable prefer-const */
    let [chatChannel, worker, issue] = await Promise.all([
      ChatChannel.findChannelGroup(issueId, [userId, user.id]),
      User.findByPk(userId, {
        attributes: User.getAttributes(),
      }),
      Issue.findByPk(issueId),
    ]);

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
    }
    const authorChat = await this.addUserToChat(chatChannel, user);
    await Promise.all([
      this.addUserToChat(chatChannel, worker),
      this.addToReviceIssue(issueId, issue.createdBy === user.id ? worker.id : user.id),
    ]);
    authorChat.setDataValue('supporting', worker.toJSON());
    const twilioToken = await twilioClient.getAccessToken(authorChat.identity);
    authorChat.setDataValue('token', twilioToken);

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
    if (type === command.REQUEST_ACCEPTANCE) {
      const { issue } = chatChannel;
      await ReceiveIssue.findByIssueIdAndCheckHasEstimation(issue.id, issueStatus.IN_PROGRESS);

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

    await this.sendMesage(type, chatChannel, user);
  }

  static async sendMesage(commandName, chatChannel, user, messageId = null, data = {}) {
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
    };

    /* eslint-disable no-undef */
    const message = __(commandMessage[commandName]);
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
    });
  }

  static async approveEstimateTime({ chatChannel, user, data }) {
    data.totalTime = +data.totalTime;
    data.workerFee = +data.workerFee;
    data.customerFee = +data.customerFee;
    const { startTime, endTime, workerFee, customerFee } = data;
    const { issue } = chatChannel;

    const userProfile = await UserProfile.findOne({ where: { userId: user.id } });

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
    await this.sendMesage(
      command.APPROVAL_ESTIMATION_TIME,
      chatChannel,
      user,
      data.messageSid,
      data
    );
  }

  static async approveMaterialCost({ chatChannel, user, data }) {
    data.totalCost = +data.totalCost;
    const { issue } = chatChannel;

    const member = await ChatMember.findOne({
      where: {
        channelId: chatChannel.id,
        userId: {
          [Op.ne]: user.id,
        },
      },
    });

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
            userId: member.userId,
          },
        }),
      ]);

      const customerFee = get(receiveIssue, 'customerFee', 0);

      if (customerProfile.accountBalance < customerFee + data.totalCost) {
        throw new Error('ISSUE-0411');
      }
    }

    await Promise.all([
      member
        ? IssueMaterial.create({
            userId: member.userId,
            issueId: issue.id,
            cost: data.totalCost,
            material: data.materials,
          })
        : null,
      this.sendMesage(command.APPROVAL_MATERIAL_COST, chatChannel, user, data.messageSid, data),
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
    await this.sendMesage(
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
    const receiveIssue = await ReceiveIssue.findByIssueIdAndCheckHasEstimation(
      issue.id,
      issueStatus.IN_PROGRESS
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
    await this.sendMesage(command.ACCEPTANCE, chatChannel, user, messageSid, data);
  }

  static async continueChatting({ chatChannel, user, data }) {
    const { messageSid } = data;
    const message = await twilioClient.fetchMessage(messageSid, chatChannel.channelSid);
    const attributes = JSON.parse(message.attributes);
    data = attributes.data || {};
    data.isContinuing = true;
    await this.sendMesage(
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
    await this.sendMesage(
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

    const transactionHistories = [
      {
        id: uuidv4(),
        userId: receiveIssue.userId,
        amount: workerFee,
        issueId,
        type: transactionType.WAGE,
        extra,
        actorId: user.id,
      },
      {
        id: uuidv4(),
        userId: user.id,
        amount: customerFee,
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
            accountBalance: Sequelize.literal(`account_balance + ${workerFee}`),
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
            accountBalance: Sequelize.literal(`account_balance - ${customerFee}`),
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
}
