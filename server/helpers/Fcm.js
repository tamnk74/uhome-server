import * as admin from 'firebase-admin';
import { notificationType } from '../constants';

const serviceAccount = require('../../firebase-admin-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default class Fcm {
  static async subscribeNewIssue(token) {
    return admin.messaging().subscribeToTopic([token], notificationType.issue);
  }

  static async unsubscribeNewIssue(token) {
    return admin.messaging().unsubscribeFromTopic([token], notificationType.chat);
  }

  static async sendNotification(tokens = [], data = {}, notification = {}) {
    const apns = {
      headers: {
        'apns-collapse-id': '0',
      },
    };

    const android = {
      collapseKey: '0',
    };

    const message = {
      data,
      tokens,
      notification,
      apns,
      android,
    };

    return admin.messaging().sendMulticast(message);
  }
}
