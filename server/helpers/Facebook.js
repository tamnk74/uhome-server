import axios from 'axios';

export default class Facebook {
  static async getUser(accessToken) {
    const zaloUrl = 'https://graph.facebook.com/v2.3/me';
    const res = await axios.get(
      `${zaloUrl}?access_token=${accessToken}&fields=id,name,gender,birthday,picture`
    );

    return res.data;
  }
}
