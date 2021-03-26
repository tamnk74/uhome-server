import { v4 as uuidv4 } from 'uuid';
import Issue from '../../../models/issue';
import { twilioClient } from '../../../helpers/Twilio';
import ChatUser from '../../../models/chatUser';
import ChatChannel from '../../../models/chatChannel';
import ChatMember from '../../../models/chatMember';
import User from '../../../models/user';

export default class IssueService {
  static async create(issue) {
    const channel = await twilioClient.createChannel();
    const [chatChannel, user] = await Promise.all([
      ChatChannel.addChannel({
        channelSid: channel.sid,
        friendlyName: channel.friendlyName,
        serviceSid: channel.serviceSid,
      }),
      User.findByPk(issue.createdBy),
    ]);
    issue.chatChannelId = chatChannel.id;
    [issue] = await Promise.all([
      await Issue.addIssue(issue),
      this.addUserToChat(chatChannel, user),
    ]);
    return issue;
  }

  static async remove(issue) {
    return Issue.removeIssue(issue);
  }

  static async getDetail(id, user) {
    const issue = await Issue.findByPk(id, {
      include: [
        {
          model: ChatChannel,
          as: 'chatChannel',
        },
      ],
    });
    const { chatChannel } = issue;
    let chatMember = await ChatMember.findOne({
      where: {
        userId: user.id,
        channelId: chatChannel.id,
      },
    });

    if (!chatMember) {
      chatMember = await this.addUserToChat(chatChannel, chatChannel);
    }

    const twilioToken = await twilioClient.getAccessToken(chatMember.identity);
    chatMember.setDataValue('token', twilioToken);
    issue.setDataValue('chatMember', chatMember.toJSON());

    return issue;
  }

  static async addUserToChat(chatChannel, user) {
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
        twilioClient.addMember(chatChannel.channelSid, userTwilio.identity, {
          friendlyName: user.name,
        }),
      ]);
    }

    return ChatMember.addMember({
      identity: chatUser.identity,
      channelSid: chatChannel.channelSid,
      friendlyName: user.name,
      serviceSid: chatChannel.serviceSid,
      roleSid: chatUser.roleSid,
      userId: user.id,
      channelId: chatChannel.id,
    });
  }
}
