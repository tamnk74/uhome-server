import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import qs from 'qs';
import { appleConfig, sentryConfig } from '../config';
import errorFactory from '../errors/ErrorFactory';

export default class Apple {
  static async generateSecretKey() {
    const fileKey = path.join(__dirname, '../../AppleAuthKey.p8');
    const privateKey = fs.readFileSync(fileKey, { encoding: 'utf-8' });
    const timeNow = Math.floor(Date.now() / 1000);

    const payload = {
      iss: appleConfig.teamId,
      aud: 'https://appleid.apple.com',
      sub: appleConfig.clientId,
      iat: timeNow,
      exp: timeNow + 15777000,
    };

    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: appleConfig.keyId,
      },
    });
  }

  static async getAccessToken(code) {
    try {
      const secretKey = await this.generateSecretKey();

      const params = {
        grant_type: 'authorization_code',
        code,
        client_id: appleConfig.clientId,
        client_secret: secretKey,
      };

      const res = await axios.request({
        method: 'POST',
        url: 'https://appleid.apple.com/auth/token',
        data: qs.stringify(params),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return res.data;
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      throw errorFactory.getError('ERR-0401');
    }
  }

  static verifyIdToken(id) {
    return jwt.decode(id);
  }
}
