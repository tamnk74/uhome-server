import { Sequelize, Op } from 'sequelize';
import dayjs from 'dayjs';
import { first, isNil, sumBy, set } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import Issue from '../../../models/issue';
import User from '../../../models/user';
import { notificationQueue, chatMessageQueue } from '../../../helpers/Queue';
import RequestSupporting from '../../../models/requestSupporting';
import { issueStatus, command, commandMessage, estimationMessageStatus } from '../../../constants';
import UserProfile from '../../../models/userProfile';
import ReceiveIssue from '../../../models/receiveIssue';
import sequelize from '../../../databases/database';
import ChatChannel from '../../../models/chatChannel';
import ChatMember from '../../../models/chatMember';
import Event from '../../../models/event';
import { twilioClient } from '../../../helpers/Twilio';
import { objectToSnake } from '../../../helpers/Util';
import FeeConfiguration from '../../../models/feeConfiguration';
import FeeCategory from '../../../models/feeCategory';
import Fee from '../../../helpers/fee/NormalFee';
import EstimationMessage from '../../../models/estimationMessage';
import FeeFactory from '../../../helpers/fee/FeeFactory';
import TeamFeeConfiguration from '../../../models/teamFeeConfiguration';

export default class IssueService {
  static async create(user, data, userEvent) {
    const issue = await Issue.addIssue(data);
    if (userEvent) {
      await userEvent.update({
        limit: userEvent.limit - 1,
      });
    }
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
    options.where.id = {
      [Op.in]: Sequelize.literal(`(${Issue.getIssueOption(user.id)})`),
      [Op.notIn]: Sequelize.literal(`(${Issue.getCancelledIssues(user.id)})`),
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
    const optionsIsRequested = {
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
      optionsIsRequested,
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
      order: [['updated_at', 'DESC']],
      limit,
      offset,
    });
  }

  static async requestSupporting(user, issue, { message }) {
    if (issue.status !== issueStatus.OPEN) {
      throw new Error('ISSUE-0002');
    }

    const requestSupporting = await RequestSupporting.findOrCreate({
      where: {
        userId: user.id,
        issueId: issue.id,
      },
      defaults: {
        id: uuidv4(),
        message,
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

  static async cancelRequestSupporting(user, issue) {
    await RequestSupporting.destroy({
      where: {
        userId: user.id,
        issueId: issue.id,
      },
    });
  }

  /**
   * Cancel supporting
   * @param {*} param
   * @returns
   */
  static async cancelSupporting({ user, receiveIssue, data }) {
    const cancelSupporting = await ReceiveIssue.cancel({
      reason: data.reason,
      receiveIssue,
      userId: user.id,
    });
    const { issue } = receiveIssue;
    set(data, 'issue.status', issue.status);
    notificationQueue.add('cancel_supporting', {
      issue,
      actorId: user.id,
      userId: issue.createdBy,
    });
    await this.sendMessage(command.CANCELED, user, issue, data);
    return cancelSupporting;
  }

  /**
   * Send estimation information
   *
   * @param {*} param
   */
  static async estimate({ user, issue, data }) {
    data.isContinuing = false;
    data.totalTime = +data.totalTime;
    data.numOfWorker = +data.numOfWorker;
    const { type, totalTime, workingTimes, numOfWorker } = data;
    const category = first(issue.categories);
    const [feeConfiguration, feeCategory, teamConfiguration, saleEvent] = await Promise.all([
      FeeConfiguration.findOne({}),
      FeeCategory.findOne({
        where: {
          categoryId: category.id,
        },
      }),
      TeamFeeConfiguration.findOne({
        where: {
          categoryId: category.id,
          minWorker: {
            [Op.gte]: numOfWorker,
          },
        },
        order: [['minWorker', 'ASC']],
      }),
      Event.findByPk(issue.eventId),
    ]);

    data.fee = FeeFactory.getFee(
      type,
      {
        teamConfiguration,
        classFee: feeCategory,
        configuration: feeConfiguration,
      },
      {
        workingTimes,
        totalTime,
        numOfWorker,
      }
    );
    data.fee.discount = saleEvent ? saleEvent.getDiscountValue(data.fee.customerFee || 0) : 0;
    set(data, 'issue.status', issue.status);

    const { message, channel } = await this.sendMessage(
      command.SUBMIT_ESTIMATION_TIME,
      user,
      issue,
      data
    );

    await IssueService.updateEstimationMessage(
      command.SUBMIT_ESTIMATION_TIME,
      channel,
      message.sid,
      {
        ...data.fee,
        totalTime,
        numOfWorker,
      }
    );

    const supporterIds = await ChatMember.getSupporterIds(channel.id);

    return ReceiveIssue.findBySupporterIds(issue.id, supporterIds);
  }

  /**
   * Notice material cost
   *
   * @param {*} param
   */
  static async noticeMaterialCost({ user, issue, data }) {
    data.isContinuing = false;
    const { materials } = data;
    const totalCost = sumBy(materials, (o) => o.cost);
    data.totalCost = +totalCost;
    set(data, 'issue.status', issue.status);

    const { message, channel } = await this.sendMessage(
      command.INFORM_MATERIAL_COST,
      user,
      issue,
      data
    );

    await IssueService.updateEstimationMessage(command.INFORM_MATERIAL_COST, channel, message.sid, {
      totalCost,
    });

    const supporterIds = await ChatMember.getSupporterIds(channel.id);

    return ReceiveIssue.findBySupporterIds(issue.id, supporterIds);
  }

  /**
   * Send Message
   * @param {*} command
   * @param {*} user
   * @param {*} issue
   * @param {*} data
   * @returns
   */
  static async sendMessage(command, user, issue, data = {}) {
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
      actor: actor.toChatActor(),
      isContinuing: data.isContinuing || false,
      is_expired: false,
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

    const messageTwilio = await twilioClient.sendMessage(chatChannel.channelSid, messageData);

    notificationQueue.add('chat_notification', {
      chatChannelId: chatChannel.id,
      actorId: user.id,
      message,
      commandName: command,
    });

    return {
      message: messageTwilio,
      channel: chatChannel,
    };
  }

  /**
   * Validate money before payment
   * @param {*} id
   * @param {*} categoriesId
   */
  static async validateMoney(id, categoriesId = []) {
    const [feeConfiguration, feeCategory, userProfile] = await Promise.all([
      FeeConfiguration.findOne({}),
      FeeCategory.findOne({
        where: {
          categoryId: categoriesId,
        },
        order: [['max', 'DESC']],
      }),
      UserProfile.findOne({ where: { userId: id } }),
    ]);

    const fee = Fee.getFee(feeConfiguration, feeCategory, dayjs(), dayjs().add(1, 'hour'), 0);

    if (fee.customerFee > userProfile.accountBalance) {
      throw new Error('ISSUE-0411');
    }
  }

  /**
   * Update an issue
   * @param {*} issue
   * @param {*} data
   * @returns
   */
  static async update(issue, data) {
    const { title, location, attachmentIds, lat, lon, paymentMethod } = data;

    if (attachmentIds) {
      await issue.addAttachments(data.attachmentIds);
    }

    return issue.update({
      title,
      location,
      lat,
      lon,
      paymentMethod,
    });
  }

  /**
   * Update estimation message
   */
  static async updateEstimationMessage(type, chatChannel, newMessageSid, data) {
    const oldMessage = await EstimationMessage.findOne({
      where: {
        type,
        channelId: chatChannel.id,
      },
    });
    if (!isNil(oldMessage)) {
      chatMessageQueue.add('update_message', {
        sid: oldMessage.messageSid,
        attributes: {
          is_expired: true,
        },
        channelSid: chatChannel.channelSid,
      });
    }

    return EstimationMessage.upsert({
      id: uuidv4(),
      type,
      channelId: chatChannel.id,
      messageSid: newMessageSid,
      data,
      status: estimationMessageStatus.WAITING,
    });
  }
}
