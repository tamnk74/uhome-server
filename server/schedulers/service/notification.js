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
import { sentryConfig } from '../../config';
import LatestIssueStatus from '../../models/latestIssueStatus';

export default class NotificationService {
  static async pushNewIssueNotification(job, done) {
    try {
      const { id } = job.data;
      const filterIssueSql = sequelize.dialect.QueryGenerator.selectQuery('category_issues', {
        attributes: ['category_id'],
        where: {
          issue_id: id,
        },
      }).slice(0, -1);
      const filteredCategorySql = sequelize.dialect.QueryGenerator.selectQuery('user_category', {
        attributes: ['user_id'],
        where: {
          category_id: {
            [Sequelize.Op.in]: Sequelize.literal(`(${filterIssueSql})`),
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
        }),
      ]);

      const dataInssert = [];
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
        dataInssert.push({
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
        Notification.bulkCreate(dataInssert),
        LatestIssueStatus.create({
          userId: issue.createdBy,
          issueId: issue.id,
          status: issueStatus.OPEN,
        }),
      ]);
      done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      done(error);
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
          },
        }),
      ]);
      const { issue } = supporting;
      const actor = supporting.user;
      const tokens = subscriptions.map((item) => item.token);
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

      done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      done(error);
    }
  }

  static async pushCancelRequestSupportingNotification(job, done) {
    try {
      const { issue, actorId, userId } = job.data;
      const [subscriptions, actor] = await Promise.all([
        Subscription.findAll({
          where: {
            userId,
          },
        }),
        User.findByPk(actorId),
      ]);
      const tokens = subscriptions.map((item) => item.token);
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
      done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      done(error);
    }
  }

  static async pushCancelSupportingNotification(job, done) {
    try {
      const { issue, actorId, userId } = job.data;
      const [subscriptions, actor] = await Promise.all([
        Subscription.findAll({
          where: {
            userId,
          },
        }),
        User.findByPk(actorId),
      ]);
      const tokens = subscriptions.map((item) => item.token);
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
      done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      done(error);
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
      const receiveIds = chatMembers.map((item) => item.userId);

      const subscriptions = await Subscription.findAll({
        where: {
          userId: receiveIds,
        },
      });
      const tokens = subscriptions.map((item) => item.token);
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

      await Promise.all([tokens.length ? Fcm.sendNotification(tokens, data, notification) : null]);
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
        },
      });
      const tokens = subscriptions.map((item) => item.token);
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

      await Promise.all([tokens.length ? Fcm.sendNotification(tokens, data, notification) : null]);
      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      done(error);
    }
  }
}
