import { Sequelize, Op } from 'sequelize';
import uuid from 'uuid';
import _ from 'lodash';
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
import { sentryConfig, pushNotificationRound } from '../../config';
import LatestIssueStatus from '../../models/latestIssueStatus';
import NotificationRound from '../../models/notificationRound';
import CategoryIssue from '../../models/categoryIssue';

export default class NotificationService {
  static async pushNewIssueNotification(job, done) {
    try {
      const { id } = job.data;
      const categoryIssues = await CategoryIssue.findAll({
        where: {
          issueId: id,
        },
      });
      const categoryIds = categoryIssues.map((item) => item.categoryId);

      const filteredCategorySql = sequelize.dialect.QueryGenerator.selectQuery('user_category', {
        attributes: ['user_id'],
        where: {
          category_id: {
            [Sequelize.Op.in]: categoryIds,
          },
        },
      }).slice(0, -1);

      const filteredNotifySql = sequelize.dialect.QueryGenerator.selectQuery('notifications', {
        attributes: ['recipient_id'],
        where: {
          issue_id: id,
          type: notificationType.newIssue,
        },
      }).slice(0, -1);

      const [subscriptions, issue, subscriptionsConsulting] = await Promise.all([
        Subscription.findAll({
          where: {
            [Op.and]: [
              {
                userId: {
                  [Sequelize.Op.notIn]: Sequelize.literal(`(${filteredNotifySql})`),
                },
              },
              {
                userId: {
                  [Sequelize.Op.in]: Sequelize.literal(`(${filteredCategorySql})`),
                },
              },
            ],
            role: userRoles.WORKER,
            deviceId: {
              [Op.ne]: null,
            },
          },
          include: [
            {
              model: User,
              require: true,
            },
          ],
          limit: 25,
        }),
        Issue.findByPk(id, {
          include: [
            {
              model: User,
              require: true,
              as: 'creator',
            },
          ],
        }),
        Subscription.findAll({
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
          recipientId: item.userId,
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
        LatestIssueStatus.create({
          userId: issue.createdBy,
          issueId: issue.id,
          status: issueStatus.OPEN,
        }),
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
}
