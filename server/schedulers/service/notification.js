import { Sequelize, Op } from 'sequelize';
import uuid from 'uuid';
import Notificaion from '../../models/notification';
import Fcm from '../../helpers/Fcm';
import Subscription from '../../models/subscription';
import User from '../../models/user';
import { notificationType } from '../../constants';
import Issue from '../../models/issue';
import sequelize from '../../databases/database';
import RequestSupporting from '../../models/requestSupporting';
import { objectToSnake } from '../../helpers/Util';
import ChatChannel from '../../models/chatChannel';
import ChatMember from '../../models/chatMember';

export default class NotificationService {
  static async pushNewIssueNotification(job, done) {
    try {
      const { id } = job.data;
      const tempSQL = sequelize.dialect.QueryGenerator.selectQuery('notifications', {
        attributes: ['recipient_id'],
        where: {
          issue_id: id,
          type: notificationType.newIssue,
        },
      }).slice(0, -1);

      const [subscriptions, issue] = await Promise.all([
        Subscription.findAll({
          where: {
            userId: {
              [Sequelize.Op.notIn]: Sequelize.literal(`(${tempSQL})`),
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
      ]);

      const dataInssert = [];
      const tokens = [];
      const actor = issue.creator;
      const notification = {
        title: `${issue.title}`,
        body: `${issue.title}`,
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

      await Promise.all([
        tokens.length ? Fcm.sendNotification(tokens, data, notification) : null,
        Notificaion.bulkCreate(dataInssert),
      ]);
      done();
    } catch (error) {
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
        title: `${issue.title}`,
        body: `${issue.title}`,
      };
      const data = {
        type: notificationType.requestSupporting,
        issue: JSON.stringify(objectToSnake(issue.fmtRes())),
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
      };
      await Promise.all([
        tokens.length ? Fcm.sendNotification(tokens, data, notification) : null,
        Notificaion.create({
          id: uuid(),
          actorId: actor.id,
          recipientId: userId,
          type: notificationType.requestSupporting,
          issueId: issue.id,
          ...notification,
          status: true,
        }),
      ]);
      done();
    } catch (error) {
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
        title: `${issue.title}`,
        body: `${issue.title}`,
      };
      const data = {
        type: notificationType.cancelRequestSupport,
        issue: JSON.stringify(objectToSnake(issue.fmtRes())),
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
      };

      await Promise.all([
        tokens.length ? Fcm.sendNotification(tokens, data, notification) : null,
        Notificaion.create({
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
        title: `${issue.title}`,
        body: `${issue.title}`,
      };
      const data = {
        type: notificationType.cancelSupport,
        issue: JSON.stringify(objectToSnake(issue.fmtRes())),
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
      };

      await Promise.all([
        tokens.length ? Fcm.sendNotification(tokens, data, notification) : null,
        Notificaion.create({
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
      done(error);
    }
  }

  static async pushChatNotification(job, done) {
    try {
      const { chatChannelId, actorId } = job.data;
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
        title: `${chatChannel.channelSid}-${chatChannel.friendlyName}`,
        body: `${chatChannel.channelSid}-${chatChannel.friendlyName}`,
      };

      const data = {
        type: notificationType.chat,
        actor: JSON.stringify(objectToSnake(actor.toJSON())),
        issue: JSON.stringify(objectToSnake(issue.fmtRes())),
        channel: JSON.stringify(objectToSnake(chatChannel.toJSON())),
      };
      await Promise.all([tokens.length ? Fcm.sendNotification(tokens, data, notification) : null]);
      return done();
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}
