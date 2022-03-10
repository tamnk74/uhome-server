import { Sequelize, Op } from 'sequelize';
import dayjs from 'dayjs';
import { get, sumBy, set, pick, min } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import Uploader from 'helpers/Uploader';
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
import UserEvent from '../../../models/userEvent';
import Event from '../../../models/event';
import { twilioClient } from '../../../helpers/Twilio';
import { objectToSnake } from '../../../helpers/Util';
import FeeConfiguration from '../../../models/feeConfiguration';
import FeeCategory from '../../../models/feeCategory';
import Fee from '../../../helpers/fee/NormalFee';
import EstimationMessage from '../../../models/estimationMessage';
import FeeFactory from '../../../helpers/fee/FeeFactory';
import TeamFeeConfiguration from '../../../models/teamFeeConfiguration';
import EventScope from '../../../models/eventScope';
import Attachment from '../../../models/attachment';
import Holiday from '../../../models/holiday';
import { googleMap } from '../../../helpers';
import Survey from '../../../models/survey';

export default class IssueService {
  static async getUploadVideoLink({ thumbnail }) {
    const name = `${uuidv4()}`;
    const path = `attachments/${name}.mp4`;
    const thumbnailPath = `attachments/thumbnails/${name}.png`;
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

  static async create(user, data) {
    const issue = await Issue.addIssue(data);
    await UserEvent.create({
      userId: user.id,
      eventId: data.saleEvent.id,
      issueId: issue.id,
    });
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
      order: [
        ['updated_at', 'DESC'],
        [Attachment, 'created_at', 'DESC'],
      ],
      limit,
      offset,
    });
  }

  static async requestSupporting(user, issue, { message, lat, lon }) {
    if (issue.status !== issueStatus.OPEN) {
      throw new Error('ISSUE-0002');
    }

    const [distance, feeConfigure] = await Promise.all([
      googleMap.getDistance(
        {
          lat,
          lng: lon,
        },
        {
          lat: get(issue, 'lat'),
          lng: get(issue, 'lon'),
        }
      ),
      FeeConfiguration.findOne(),
    ]);

    const distanceFee =
      distance <= get(feeConfigure, 'minDistance', 0)
        ? 0
        : min([
            distance * get(feeConfigure, 'distance', 0),
            get(feeConfigure, 'maxDistanceFee', 0),
          ]);

    const requestSupporting = await RequestSupporting.findOrCreate({
      where: {
        userId: user.id,
        issueId: issue.id,
      },
      defaults: {
        id: uuidv4(),
        message,
        distance,
        lat,
        lon,
        distanceFee: Math.ceil(distanceFee / 1000) * 1000,
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
          attributes: RequestSupporting.getAttributes(),
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
    const categories = get(issue, 'categories', []);
    const categoriesId = categories.map((item) => item.id);

    const [feeConfiguration, feeCategory, saleEvent, holidays] = await Promise.all([
      FeeConfiguration.findOne({}),
      FeeCategory.findOne({
        where: {
          categoryId: categoriesId,
        },
        order: [['max', 'DESC']],
      }),
      Event.findByPk(issue.eventId, {
        include: [
          {
            model: EventScope,
          },
        ],
      }),
      Holiday.findAll({
        where: {
          from: {
            [Op.gte]: dayjs().toISOString(),
          },
        },
      }),
    ]);

    const [teamConfiguration, requestSupporting, survey] = await Promise.all([
      TeamFeeConfiguration.findOne({
        where: {
          categoryId: feeCategory.categoryId,
          minWorker: {
            [Op.lte]: numOfWorker,
          },
        },
        order: [['minWorker', 'DESC']],
      }),
      RequestSupporting.findOne({
        where: {
          issueId: issue.id,
          userId: user.id,
        },
      }),
      Survey.findOne({
        where: {
          issueId: issue.id,
          userId: user.id,
          status: issueStatus.APPROVAL,
        },
      }),
    ]);

    const cost = FeeFactory.getCost(
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
        holidays,
      }
    );

    const distance = get(requestSupporting, 'distance', 0);
    const configDistanceFee = get(feeConfiguration, 'distance', 0);
    const distanceFee = Math.ceil((distance * configDistanceFee) / 1000) * 1000;

    set(data, 'worker', cost.worker);
    set(data, 'customer', cost.customer);
    const discount = saleEvent ? saleEvent.getDiscount(cost.worker.cost, cost.customer.cost) : null;
    set(data, 'worker.discount', get(discount, 'worker', 0));
    set(data, 'customer.discount', get(discount, 'customer', 0));
    set(data, 'issue.status', issue.status);
    set(data, 'workingTimes', IssueService.convertEstimateTimeToUTC(workingTimes));
    set(data, 'worker.distanceFee', distanceFee);
    set(data, 'customer.distanceFee', distanceFee);
    set(data, 'customer.surveyFee', get(survey, 'data.surveyFee', 0));
    set(data, 'worker.surveyFee', get(survey, 'data.surveyFee', 0));

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
        ...pick(data, EstimationMessage.baseAttributeOnData()),
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

    await EstimationMessage.create({
      id: uuidv4(),
      type: command.INFORM_MATERIAL_COST,
      channelId: channel.id,
      messageSid: message.sid,
      data: {
        totalCost,
      },
      status: estimationMessageStatus.WAITING,
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
    const [message, isCreated] = await EstimationMessage.findOrCreate({
      where: {
        type,
        channelId: chatChannel.id,
      },
      defaults: {
        id: uuidv4(),
        type,
        channelId: chatChannel.id,
        messageSid: newMessageSid,
        data,
        status: estimationMessageStatus.WAITING,
      },
    });

    if (!isCreated) {
      chatMessageQueue.add('update_message', {
        sid: message.messageSid,
        attributes: {
          is_expired: true,
        },
        channelSid: chatChannel.channelSid,
      });

      await message.update({
        type,
        channelId: chatChannel.id,
        messageSid: newMessageSid,
        data,
        status: estimationMessageStatus.WAITING,
      });
    }

    return message;
  }

  /**
   * Convert estimate time to UTC
   */
  static convertEstimateTimeToUTC(estimateTimes = []) {
    return estimateTimes.map((item) => ({
      startTime: dayjs(item.startTime).utc().toISOString(),
      endTime: dayjs(item.endTime).utc().toISOString(),
    }));
  }
}
