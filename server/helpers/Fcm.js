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
    const message = {
      data,
      tokens,
      notification,
    };
    return admin.messaging().sendMulticast(message);
  }
}
