import axios from 'axios';
import { speedSMSConfig } from '../config';

const URL = 'https://api.speedsms.vn/index.php';

const SMS_TYPE_CSKH = 2;

export default class SpeedSMS {
  static async sendSMS({ to, content }) {
    const res = await axios.post(
      `${URL}/sms/send`,
      {
        to,
        content,
        sms_type: SMS_TYPE_CSKH,
        sender: speedSMSConfig.branchName,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-type': 'application/json',
        },
        auth: {
          username: speedSMSConfig.accessToken,
        },
      }
    );

    return res.data;
  }
}
