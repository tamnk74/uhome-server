import uuid, { v4 as uuidv4 } from 'uuid';
import ChatMember from '../../../models/chatMember';
import { twilioClient } from '../../../helpers/Twilio';
import ChatChannel from '../../../models/chatChannel';
import User from '../../../models/user';
import ChatUser from '../../../models/chatUser';
import ReceiveIssue from '../../../models/receiveIssue';
import { commandMessage, issueStatus, command } from '../../../constants';
import { objectToSnake } from '../../../helpers/Util';
import { notificationQueue } from '../../../helpers/Queue';
import Issue from '../../../models/issue';

export default class ChatService {
  static async create(user, data) {
    const { userId, issueId } = data;
    /* eslint-disable prefer-const */
    let [chatChannel, worker] = await Promise.all([
      ChatChannel.findChannelGroup(issueId, [userId, user.id]),
      User.findByPk(userId),
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
      this.addToReviceIssue(issueId, worker.id),
    ]);

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

  static async approveEstimateCost({ chatChannel, user, data }) {
    if ([issueStatus.IN_PROGRESS, issueStatus.DONE].includes(chatChannel.issue.status)) {
      throw new Error('CHAT-0405');
    }
    const chatMembers = await ChatMember.findAll({
      where: {
        channelId: chatChannel.id,
      },
    });
    const userIds = chatMembers.map((member) => member.userId);
    if (userIds.length < 2) {
      throw new Error('CHAT-0404');
    }

    await Promise.all([
      ReceiveIssue.update(
        {
          cost: data.cost,
          time: data.totalTime,
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
    await this.sendMesage(command.APPROVAL_ESTIMATION_COST, chatChannel, user, data.messageSid);
    notificationQueue.add('chat_notification', { chatChannelId: chatChannel.id, actorId: user.id });
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
    await this.sendMesage(type, chatChannel, user);
    notificationQueue.add('chat_notification', { chatChannelId: chatChannel.id, actorId: user.id });
  }

  static async sendMesage(commandName, chatChannel, user, messageId = null, data = {}) {
    const chatMember = await ChatMember.findOne({
      where: {
        channelId: chatChannel.id,
        userId: user.id,
      },
    });

    if (!chatMember) {
      throw new Error('MEMBER-0404');
    }

    const messageAttributes = {
      type: 'command',
      commandName,
      data,
    };

    /* eslint-disable no-undef */
    const messageData = {
      from: chatMember.identity,
      channelSid: chatChannel.channelSid,
      type: 'action',
      body: __(commandMessage[commandName]),
      attributes: JSON.stringify(objectToSnake(messageAttributes)),
    };

    if (messageId) {
      await twilioClient.sendMessage(chatChannel.channelSid, messageData);
    } else {
      await twilioClient.updateMessage(messageId, chatChannel.channelSid, messageData);
    }
  }
}
