import { Sequelize } from 'sequelize';
import uuid from 'uuid';
import Notificaion from '../../models/notification';
import Fcm from '../../helpers/Fcm';
import Subscription from '../../models/subscription';
import User from '../../models/user';
import { notificationType } from '../../constants';
import Issue from '../../models/issue';
import sequelize from '../../databases/database';

export default class NotificationService {
  static async pushNewIssueNotification(job, done) {
    try {
      const { id } = job.data;
      const tempSQL = sequelize.dialect.QueryGenerator.selectQuery('notifications', {
        attributes: ['recipient_id'],
        where: {
          issue_id: id,
          type: notificationType.issue,
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
        Issue.findByPk(id),
      ]);

      const dataInssert = [];
      const tokens = [];
      const notification = {
        title: '',
        body: '',
      };
      const data = {
        type: notificationType.issue,
        issue:issue.fmtRes(),
      };

      subscriptions.forEach((item) => {
        tokens.push(item.token);
        dataInssert.push({
          id: uuid(),
          actorId: issue.createdBy,
          recipientId: item.userId,
          type: notificationType.issue,
          issueId: id,
          ...notification,
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

  static async pushChatNotification(job, done) {
    const { id } = job.data;
    done(id);
  }
}
