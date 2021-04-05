import { v4 as uuidv4 } from 'uuid';
import ChatMember from '../../../models/chatMember';
import { twilioClient } from '../../../helpers/Twilio';
import ChatChannel from '../../../models/chatChannel';
import User from '../../../models/user';
import ChatUser from '../../../models/chatUser';
import { command, commandMessage } from '../../../constants';
import { objectToSnake } from '../../../helpers/Util';

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
      chatChannel = await ChatChannel.addChannel({
        channelSid: channel.sid,
        friendlyName: channel.friendlyName,
        serviceSid: channel.serviceSid,
        issueId,
      });
    }

    const [authorChat] = await Promise.all([
      this.addUserToChat(chatChannel, user),
      this.addUserToChat(chatChannel, worker),
    ]);

    const twilioToken = await twilioClient.getAccessToken(authorChat.identity);
    authorChat.setDataValue('token', twilioToken);

    return authorChat;
  }

  static async addUserToChat(chatChannel, user) {
    const member = await ChatMember.findMember(user.id, chatChannel.issueId);

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

  static async sendCommand(chatChannel, user, data) {
    const { commandName, startTime, totalTime, totalCost, materials } = data;
    const chatMember = await ChatMember.findOne({
      where: {
        channelId: chatChannel.id,
        userId: user.id,
      },
    });

    if (!chatMember) {
      throw new Error('MEMBER-0404');
    }
    const messageData = {
      from: chatMember.identity,
      channelSid: chatChannel.channelSid,
      type: 'action',
    };
    const messageAttributes = {
      type: 'command',
      commandName,
      data: {},
    };

    switch (commandName) {
      case command.SUBMIT_ESTIMATION:
        messageAttributes.data = {
          startTime,
          totalTime,
        };
        break;
      case command.INFORM_MATERIAL_COST:
        messageAttributes.data = {
          totalCost,
          materials,
        };
        break;
      default:
        break;
    }
    /* eslint-disable no-undef */
    messageData.body = __(commandMessage[commandName]);
    messageData.attributes = JSON.stringify(objectToSnake(messageAttributes));
    await twilioClient.sendMessage(chatChannel.channelSid, messageData);
  }
}
