import schedule from 'node-schedule';
import NotificationService from '../service/notification';
import { notificationQueue } from '../../helpers/Queue';

schedule.scheduleJob('15 * * * *', async () => {});

notificationQueue.process('new_issue', NotificationService.pushNewIssueNotification);
notificationQueue.process(
  'request_supporting',
  NotificationService.pushRequestSupportingNotification
);
notificationQueue.process(
  'cancel_request_supporting',
  NotificationService.pushCancelRequestSupportingNotification
);

notificationQueue.process(
  'cancel_supporting',
  NotificationService.pushCancelSupportingNotification
);
