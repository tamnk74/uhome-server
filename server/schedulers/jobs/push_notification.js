import schedule from 'node-schedule';
import NotificationService from '../service/notification';
import { notificationQueue } from '../../helpers/Queue';

schedule.scheduleJob('15 * * * *', async () => {});

notificationQueue.process('issue', NotificationService.pushNewIssueNotification);
notificationQueue.process(
  'request_supporting',
  NotificationService.pushRequestSupportingNotification
);
