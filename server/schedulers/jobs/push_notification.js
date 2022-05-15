import schedule from 'node-schedule';
import NotificationService from '../service/notification';
import { notificationQueue } from '../../helpers/Queue';

// eslint-disable-next-line no-unused-vars
const scanNewIssue = schedule.scheduleJob('*/15 * * * *', async () => {
  await NotificationService.scanIssueWaitToSupport();
});

notificationQueue.process('new_issue', NotificationService.pushNewIssueNotification);
notificationQueue.process('receive_bonus', NotificationService.pushBonusNotification);
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

notificationQueue.process('chat_notification', NotificationService.pushChatNotification);
