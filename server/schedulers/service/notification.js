import { Sequelize, Op } from 'sequelize';
import uuid from 'uuid';
import _ from 'lodash';
import dayjs from 'dayjs';
import Notification from '../../models/notification';
import Fcm from '../../helpers/Fcm';
import Subscription from '../../models/subscription';
import User from '../../models/user';
import {
  notificationType,
  userRoles,
  notificationMessage,
  roles,
  issueStatus,
} from '../../constants';
import Issue from '../../models/issue';
import sequelize from '../../databases/database';
import RequestSupporting from '../../models/requestSupporting';
import { objectToSnake } from '../../helpers/Util';
import ChatChannel from '../../models/chatChannel';
import ChatMember from '../../models/chatMember';
import { sentryConfig, pushNotificationRound, maximumNotificationOneRound } from '../../config';
import LatestIssueStatus from '../../models/latestIssueStatus';
import NotificationRound from '../../models/notificationRound';
import Category from '../../models/category';
import { notificationQueue } from '../../helpers/Queue';

export default class NotificationService {
  static async pushNewIssueNotification(job, done) {
    try {
      const { id, isRepeated = false } = job.data;
      const issue = await Issue.findByPk(id, {
        include: [
          {
            model: User,
            require: true,
            as: 'creator',
          },
          {
            model: Category,
            require: true,
            as: 'categories',
          },
        ],
      });
      const categories = _.get(issue, 'categories', []);
      const categoryIds = categories.map((item) => item.id);

      if (_.isEmpty(categoryIds)) {
        return done();
      }

      const sql = `SELECT subscriptions.*, 
        ST_DISTANCE_SPHERE(POINT(users.lon, users.lat), POINT(:issueLon, :issueLat)) AS distance
        FROM subscriptions
          INNER JOIN users ON users.id = subscriptions.user_id
          INNER JOIN user_profiles ON user_profiles.user_id = users.id
          INNER JOIN user_category ON user_category.user_id = users.id AND category_id IN (:categoryIds)
          LEFT JOIN notifications ON notifications.recipient_id = users.id AND issue_id = :issueId AND type = :type
        WHERE
          subscriptions.role = :role AND notifications.id IS NULL and users.status = 1 and device_id IS NULL
        ORDER BY user_profiles.reliability DESC , distance ASC
        LIMIT :limit`;

      const [subscriptions, subscriptionsConsulting] = await Promise.all([
        sequelize.query(sql, {
          replacements: {
            categoryIds: categoryIds || [''],
            issueLon: issue.lon,
            issueLat: issue.lat,
            issueId: id,
            type: notificationType.newIssue,
            limit: maximumNotificationOneRound,
            role: userRoles.WORKER,
          },
          type: Sequelize.QueryTypes.SELECT,
        }),
        isRepeated
          ? []
          : Subscription.findAll({
              include: [
                {
                  model: User,
                  require: true,
                  where: {
                    role: roles.CONSULTING,
                  },
                },
              ],
              where: {
                deviceId: {
                  [Op.ne]: null,
                },
              },
            }),
      ]);

      const dataInsert = [];
      const tokens = [];
      const actor = issue.creator;
      const notification = {
        title: Notification.getTitle('notification.new_issue', { title: issue.title }),
        body: Notification.getTitle('notification.new_issue', { title: issue.title }),
      };
      const data = {
        type: notificationType.newIssue,
        issue: JSON.stringify(objectToSnake(issue.fmtRes())),
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
      };

      subscriptions.forEach((item) => {
        tokens.push(item.token);
        dataInsert.push({
          id: uuid(),
          actorId: issue.createdBy,
          recipientId: item.user_id,
          type: notificationType.newIssue,
          issueId: id,
          ...notification,
          status: true,
        });
      });

      subscriptionsConsulting.forEach((item) => {
        tokens.push(item.token);
      });

      await Promise.all([
        tokens.length ? Fcm.sendNotification(tokens, data, notification) : null,
        Notification.bulkCreate(dataInsert),
      ]);
      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      return done(error);
    }
  }

  static async pushRequestSupportingNotification(job, done) {
    try {
      const { requestId, userId } = job.data;
      const [supporting, subscriptions] = await Promise.all([
        RequestSupporting.findByPk(requestId, {
          include: [
            {
              model: Issue,
              require: true,
            },
            {
              model: User,
              require: true,
            },
          ],
        }),
        Subscription.findAll({
          where: {
            userId,
            deviceId: {
              [Op.ne]: null,
            },
          },
        }),
      ]);
      const { issue } = supporting;
      const actor = supporting.user;
      const tokens = _.compact(subscriptions.map((item) => item.token));

      if (_.isEmpty(tokens)) {
        return done();
      }

      const notification = {
        title: Notification.getTitle('notification.request_support', { title: issue.title }),
        body: Notification.getTitle('notification.request_support', { title: issue.title }),
      };
      const data = {
        type: notificationType.requestSupporting,
        issue: JSON.stringify(objectToSnake(issue.fmtRes())),
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
      };
      await Promise.all([
        tokens.length ? Fcm.sendNotification(tokens, data, notification) : null,
        Notification.create({
          id: uuid(),
          actorId: actor.id,
          recipientId: userId,
          type: notificationType.requestSupporting,
          issueId: issue.id,
          ...notification,
          status: true,
        }),
        LatestIssueStatus.upsert({
          id: uuid(),
          issueId: issue.id,
          userId: issue.createdBy,
          status: issueStatus.REQUESTING_SUPPORT,
        }),
      ]);

      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      return done(error);
    }
  }

  static async pushCancelRequestSupportingNotification(job, done) {
    try {
      const { issue, actorId, userId } = job.data;
      const [subscriptions, actor] = await Promise.all([
        Subscription.findAll({
          where: {
            userId,
            deviceId: {
              [Op.ne]: null,
            },
          },
        }),
        User.findByPk(actorId),
      ]);
      const tokens = _.compact(subscriptions.map((item) => item.token));

      if (_.isEmpty(tokens)) {
        return done();
      }

      const notification = {
        title: Notification.getTitle('notification.cancel', { title: issue.title }),
        body: Notification.getTitle('notification.cancel', { title: issue.title }),
      };
      const data = {
        type: notificationType.cancelRequestSupport,
        issue: JSON.stringify(objectToSnake(issue)),
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
      };

      await Promise.all([
        tokens.length ? Fcm.sendNotification(tokens, data, notification) : null,
        Notification.create({
          id: uuid(),
          actorId,
          recipientId: userId,
          type: notificationType.cancelRequestSupport,
          issueId: issue.id,
          ...notification,
          status: true,
        }),
      ]);
      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      return done(error);
    }
  }

  static async pushCancelSupportingNotification(job, done) {
    try {
      const { issue, actorId, userId } = job.data;
      const [subscriptions, actor] = await Promise.all([
        Subscription.findAll({
          where: {
            userId,
            deviceId: {
              [Op.ne]: null,
            },
          },
        }),
        User.findByPk(actorId),
      ]);
      const tokens = _.compact(subscriptions.map((item) => item.token));

      if (_.isEmpty(tokens)) {
        return done();
      }

      const notification = {
        title: Notification.getTitle('notification.cancel', { title: issue.title }),
        body: Notification.getTitle('notification.cancel', { title: issue.title }),
      };
      const data = {
        type: notificationType.cancelSupport,
        issue: JSON.stringify(objectToSnake(issue)),
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
      };

      await Promise.all([
        tokens.length ? Fcm.sendNotification(tokens, data, notification) : null,
        Notification.create({
          id: uuid(),
          actorId,
          recipientId: userId,
          type: notificationType.cancelSupport,
          issueId: issue.id,
          ...notification,
          status: true,
        }),
        LatestIssueStatus.upsert({
          id: uuid(),
          issueId: issue.id,
          userId: issue.createdBy,
          status: issueStatus.OPEN,
        }),
      ]);
      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      return done(error);
    }
  }

  static async pushChatNotification(job, done) {
    try {
      const { chatChannelId, actorId, commandName, message = '' } = job.data;
      const [chatChannel, chatMembers, actor] = await Promise.all([
        ChatChannel.findByPk(chatChannelId, {
          include: [
            {
              model: Issue,
              require: true,
            },
          ],
        }),
        ChatMember.findAll({
          where: {
            channelId: chatChannelId,
            userId: {
              [Op.ne]: actorId,
            },
          },
        }),
        User.findByPk(actorId),
      ]);

      if (!chatChannel) {
        return done();
      }

      const { issue } = chatChannel;
      const memberIds = chatMembers.map((item) => item.userId);
      const receives = await NotificationRound.findAll({
        where: {
          userId: memberIds,
          channelId: chatChannel.id,
          [Op.and]: [
            Sequelize.where(Sequelize.literal(`mod(round, ${pushNotificationRound})`), '=', 0),
          ],
        },
      });

      const receiveIds = receives.map((item) => item.userId);
      const subscriptions = await Promise.all([
        Subscription.findAll({
          where: {
            userId: receiveIds,
            deviceId: {
              [Op.ne]: null,
            },
          },
        }),
        NotificationRound.update(
          {
            round: Sequelize.literal(`round + 1`),
          },
          {
            where: {
              userId: memberIds,
              channelId: chatChannel.id,
            },
          }
        ),
      ]);
      const tokens = _.compact(subscriptions.map((item) => item.token));

      if (_.isEmpty(tokens)) {
        return done();
      }

      const notification = {
        title: Notification.getTitle(_.get(notificationMessage, commandName, commandName), {
          title: issue.title,
        }),
        body: message,
      };

      const data = {
        type: notificationType.chat,
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
        issue: JSON.stringify(objectToSnake(issue)),
        channel: JSON.stringify(objectToSnake(chatChannel.toJSON())),
      };
      await Fcm.sendNotification(tokens, data, notification);

      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      done(error);
    }
  }

  static async pushBonusNotification(job, done) {
    try {
      const { actorId, issue, transaction } = job.data;
      const subscriptions = await Subscription.findAll({
        where: {
          userId: [actorId],
          deviceId: {
            [Op.ne]: null,
          },
        },
      });
      const tokens = _.compact(subscriptions.map((item) => item.token));

      if (_.isEmpty(tokens)) {
        return done();
      }

      const notification = {
        title: 'You just got a bonus!',
        body: {
          issue,
          transaction,
        },
      };

      const data = {
        type: notificationType.bonus,
        issue: JSON.stringify(issue),
        transaction: JSON.stringify(transaction),
      };

      await Fcm.sendNotification(tokens, data, notification);

      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      return done(error);
    }
  }

  static async scanIssueWaitToSupport() {
    const now = dayjs().subtract(15, 'm');

    const issues = await Issue.findAll({
      include: [
        {
          model: RequestSupporting,
          require: false,
          as: 'requestSupportings',
        },
      ],
      where: {
        [Op.and]: [
          {
            createdAt: {
              [Op.lte]: now,
            },
          },
          sequelize.where(sequelize.col('requestSupportings.id'), 'IS', null),
        ],
      },
      group: ['id'],
    });
    issues.forEach((issue) =>
      notificationQueue.add('new_issue', { id: issue.id, isRepeated: true })
    );
  }
}
