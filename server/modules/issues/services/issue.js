import { Sequelize, Op } from 'sequelize';
import dayjs from 'dayjs';
import { first } from 'lodash';
import Issue from '../../../models/issue';
import User from '../../../models/user';
import { notificationQueue } from '../../../helpers/Queue';
import RequestSupporting from '../../../models/requestSupporting';
import { issueStatus, command, commandMessage } from '../../../constants';
import UserProfile from '../../../models/userProfile';
import ReceiveIsssue from '../../../models/receiveIssue';
import sequelize from '../../../databases/database';
import ChatChannel from '../../../models/chatChannel';
import ChatMember from '../../../models/chatMember';
import { twilioClient } from '../../../helpers/Twilio';
import { objectToSnake } from '../../../helpers/Util';
import FeeConfiguration from '../../../models/feeConfiguration';
import FeeCategory from '../../../models/feeCategory';
import Fee from '../../../helpers/Fee';

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
          attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'lon', 'lat'],
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
    const { limit, offset, categoryIds, user } = query;
    const options = Issue.buildOptionQuery(query);
    options.where.createdBy = {
      [Op.ne]: user.id,
    };

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
          attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'lon', 'lat'],
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
          attributes: ['id', 'userId', 'reliability', 'totalIssueCompleted'],
        },
      ],
      nest: true,
      limit,
      offset,
    });
  }

  static async cacelRequestSupporting(user, issue) {
    await RequestSupporting.destroy({
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
    await this.sendMesage(command.CANCELED, user, issue, data);
    return cancelSupporting;
  }

  static async estimate({ user, issue, data }) {
    data.isContinuing = false;
    data.totalTime = +data.totalTime;
    const { startTime, endTime } = data;
    const catefory = first(issue.categories);
    const [feeConfiguration, feeCategory] = await Promise.all([
      FeeConfiguration.findOne({}),
      FeeCategory.findOne({
        where: {
          categoryId: catefory.id,
        },
      }),
    ]);
    data.fee = Fee.getFee(feeConfiguration, feeCategory, dayjs(startTime), dayjs(endTime), 0);

    await this.sendMesage(command.SUBMIT_ESTIMATION_TIME, user, issue, data);
  }

  static async noticeMaterialCost({ user, issue, data }) {
    data.isContinuing = false;
    data.totalCost = +data.totalCost;
    await this.sendMesage(command.INFORM_MATERIAL_COST, user, issue, data);
  }

  static async sendMesage(command, user, issue, data = {}) {
    const [chatMember, actor] = await Promise.all([
      ChatMember.findOne({
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
      }),
      User.findByPk(user.id, {
        attributes: User.getAttributes(),
      }),
    ]);

    if (!chatMember) {
      throw new Error('MEMBER-0404');
    }

    const { chatChannel } = chatMember;

    const messageAttributes = {
      type: 'command',
      commandName: command,
      data,
      actor: actor.toJSON(),
      isContinuing: data.isContinuing || false,
    };
    /* eslint-disable no-undef */
    const message = __(commandMessage[command]);
    const messageData = {
      from: chatMember.identity,
      channelSid: chatChannel.channelSid,
      type: 'action',
      body: message,
      attributes: JSON.stringify(objectToSnake(messageAttributes)),
    };

    await twilioClient.sendMessage(chatChannel.channelSid, messageData);
    notificationQueue.add('chat_notification', {
      chatChannelId: chatChannel.id,
      actorId: user.id,
      message,
    });
  }
}
