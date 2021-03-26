import { twilioClient } from '../../helpers/Twilio';
import ChatUser from '../../models/chatUser';

module.exports = {
  up: async () => {
    const limit = 20;
    let page = 0;
    let users = [];
    /* eslint-disable no-await-in-loop */
    do {
      const result = await twilioClient.getUsers(limit, page);
      page += 1;
      users = result;
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const chatUser = await ChatUser.findOne({
          where: {
            userSid: user.sid,
          },
        });
        if (!chatUser) {
          await ChatUser.create({
            userSid: user.sid,
            friendlyName: user.friendlyName,
            roleSid: user.roleSid,
            serviceSid: user.serviceSid,
            identity: user.identity,
          });
        }
      }
    } while (users.length === limit);

    return Promise.resolve();
  },

  down: () => Promise.resolve(),
};
