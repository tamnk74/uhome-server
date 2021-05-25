import { Sequelize } from 'sequelize';
import Issue from '../../../models/issue';
import User from '../../../models/user';
import { notificationQueue } from '../../../helpers/Queue';
import RequestSupporting from '../../../models/requestSupporting';
import { issueStatus, command, commandMessage } from '../../../constants';
import UserProfile from '../../../models/userProfile';
import ReceiveIsssue from '../../../models/receiveIssue';
import Rating from '../../../models/rating';
import sequelize from '../../../databases/database';
import ChatChannel from '../../../models/chatChannel';
import ChatMember from '../../../models/chatMember';
import { twilioClient } from '../../../helpers/Twilio';
import { objectToSnake } from '../../../helpers/Util';

export default class IssueService {
  static async create(user, issue) {
    issue = await Issue.addIssue(issue);
    notificationQueue.add('new_issue', { id: issue.id });
    return this.getDetail(user, issue.id);
  }

  static async remove(issue) {
    return Issue.removeIssue(issue);
  }

  static async getDetail(user, id) {
    const issue = await Issue.findByPk(id, {
      include: [
        ...Issue.buildRelation(),
        {
          model: RequestSupporting,
          required: false,
          as: 'requestSupportings',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'longitude', 'latitude'],
        },
      ],
    });

    issue.setDataValue('totalRequestSupporting', issue.requestSupportings.length);
    issue.setDataValue('isRequested', 0);
    issue.requestSupportings.forEach((item) => {
      if (item.userId === user.id) {
        issue.setDataValue('isRequested', 1);
      }
    });
    issue.setDataValue('requestSupportings', undefined);

    return issue;
  }

  static async getIssues(query) {
    const { limit, offset, categoryIds, status, user } = query;
    const filter = query.filter || {};
    if (status) {
      filter.status = status;
    }
    query.filter = filter;
    const options = Issue.buildOptionQuery(query);
    const optionsCount = {
      attributes: [[Sequelize.fn('COUNT', Sequelize.col('issue_id')), 'totalRequestSupporting']],
      where: {
        issue_id: {
          [Sequelize.Op.eq]: sequelize.col('issues.id'),
        },
      },
    };
    const countSQL = sequelize.dialect.QueryGenerator.selectQuery(
      'request_supportings',
      optionsCount,
      RequestSupporting
    ).slice(0, -1);
    const optionsIsrequested = {
      attributes: [[Sequelize.fn('COUNT', Sequelize.col('issue_id')), 'isRequested']],
      where: {
        issue_id: {
          [Sequelize.Op.eq]: sequelize.col('issues.id'),
        },
        user_id: {
          [Sequelize.Op.eq]: user.id,
        },
      },
    };
    const isRequestedSQL = sequelize.dialect.QueryGenerator.selectQuery(
      'request_supportings',
      optionsIsrequested,
      RequestSupporting
    ).slice(0, -1);

    return Issue.findAndCountAll({
      ...options,
      include: [
        ...Issue.buildRelation(categoryIds),
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'longitude', 'latitude'],
        },
      ],
      attributes: {
        include: [
          [Sequelize.literal(`(${countSQL})`), 'totalRequestSupporting'],
          [Sequelize.literal(`(${isRequestedSQL})`), 'isRequested'],
        ],
      },
      limit,
      offset,
    });
  }

  static async requestSupporting(user, issue) {
    if (issue.status !== issueStatus.OPEN) {
      throw new Error('ISSUE-0002');
    }

    const requestSupporting = await RequestSupporting.findOrCreate({
      where: {
        userId: user.id,
        issueId: issue.id,
      },
    });
    notificationQueue.add('request_supporting', {
      requestId: requestSupporting[0].id,
      userId: issue.createdBy,
    });
    return requestSupporting;
  }

  static async getRequestSupporting(query) {
    const { limit, offset, id } = query;
    return User.findAndCountAll({
      include: [
        {
          model: RequestSupporting,
          as: 'requestSupportings',
          required: true,
          where: {
            issueId: id,
          },
        },
        {
          model: UserProfile,
          as: 'profile',
          required: true,
          attributes: ['id', 'userId', 'reliability'],
        },
      ],
      nest: true,
      raw: true,
      limit,
      offset,
    });
  }

  static async cacelRequestSupporting(user, issue) {
    return RequestSupporting.destroy({
      where: {
        userId: user.id,
        issueId: issue.id,
      },
    });
  }

  static async cancelSupporting({ user, receiveIssue, data }) {
    const cancelSupporting = await ReceiveIsssue.cancel({
      reason: data.reason,
      receiveIssue,
      userId: user.id,
    });
    const { issue } = receiveIssue;
    notificationQueue.add('cancel_supporting', {
      issue,
      actorId: user.id,
      userId: issue.createdBy,
    });
    return cancelSupporting;
  }

  static async setRating({ receiveIssue, data }) {
    const [rating] = await Promise.all([
      Rating.create({
        ...data,
        receiveIssueId: receiveIssue.id,
        userId: receiveIssue.userId,
      }),
      // Update issue status
    ]);

    // Todo: Send notification

    return rating;
  }

  static async estimate({ user, issue, data }) {
    await this.sendMesage(command.SUBMIT_ESTIMATION, user, issue, data);
  }

  static async noticeMaterialCost({ user, issue, data }) {
    await this.sendMesage(command.INFORM_MATERIAL_COST, user, issue, data);
  }

  static async sendMesage(command, user, issue, data = {}) {
    const chatMember = await ChatMember.findOne({
      where: {
        userId: user.id,
      },
      include: [
        {
          model: ChatChannel,
          as: 'chatChannel',
          required: true,
          where: {
            issueId: issue.id,
          },
        },
      ],
    });

    if (!chatMember) {
      throw new Error('MEMBER-0404');
    }

    const { chatChannel } = chatMember;

    const messageAttributes = {
      type: 'command',
      commandName: command,
      data,
    };

    /* eslint-disable no-undef */
    const messageData = {
      from: chatMember.identity,
      channelSid: chatChannel.channelSid,
      type: 'action',
      body: __(commandMessage[command]),
      attributes: JSON.stringify(objectToSnake(messageAttributes)),
    };

    await twilioClient.sendMessage(chatChannel.channelSid, messageData);
    notificationQueue.add('chat_notification', { chatChannelId: chatChannel.id, actorId: user.id });
  }
}
