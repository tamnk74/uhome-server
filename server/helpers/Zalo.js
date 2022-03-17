import axios from 'axios';
import qs from 'qs';
import { zaloConfig } from '../config';

export default class Zalo {
  static async getAccessToken(code, codeVerifier) {
    const zaloUrl = 'https://oauth.zaloapp.com/v4/access_token';
    const data = {
      code,
      app_id: zaloConfig.appId,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    };

    const headers = {
      secret_key: zaloConfig.appSecret,
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const res = await axios({
      method: 'POST',
      url: zaloUrl,
      data: qs.stringify(data),
      headers,
    });

    const { access_token: accessToken, error } = res.data;
    if (error) {
      throw new Error('LOG-0006');
    }

    return accessToken;
  }

  static async getUser(accessToken) {
    const zaloUrl = 'https://graph.zalo.me/v2.0/me';
    const res = await axios({
      method: 'GET',
      url: zaloUrl,
      headers: {
        access_token: accessToken,
      },
      params: {
        fields: 'id,name,picture',
      },
    });

    const { error } = res.data;
    if (error) {
      throw new Error('LOG-0006');
    }
    return res.data;
  }
}
