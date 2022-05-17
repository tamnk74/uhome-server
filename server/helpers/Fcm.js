import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
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
    const collapseId = uuidv4();

    const apns = {
      headers: {
        'apns-collapse-id': collapseId,
      },
    };

    const android = {
      collapseKey: collapseId,
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
