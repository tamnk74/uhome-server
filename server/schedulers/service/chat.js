import { twilioClient } from '../../helpers/Twilio';

export default class ChatService {
  static async updateMessage(job, done) {
    try {
      const { sid, attributes, channelSid } = job.data;
      const message = await twilioClient.fetchMessage(sid, channelSid);
      let attributesMess = JSON.parse(message.attributes);
      attributesMess = {
        ...attributesMess,
        ...attributes,
      };
      await twilioClient.updateMessage(sid, channelSid, {
        attributes: JSON.stringify(attributesMess),
      });
      return done();
    } catch (error) {
      return done(error);
    }
  }
}
