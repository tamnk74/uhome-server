import schedule from 'node-schedule';
import { verifyIdentifyCardQueue } from '../../helpers/Queue';
import OrcService from '../service/orc';
import User from '../../models/user';
import { idCardStatus } from '../../constants';

schedule.scheduleJob('*/1 * * * *', async () => {
  const users = await User.findAll({
    where: {
      idCardStatus: idCardStatus.WAITING_VERIFY_CARD,
    },
  });
  users.forEach((user) => {
    verifyIdentifyCardQueue.add('get_identify_card', {
      userId: user.id,
    });
  });
});

verifyIdentifyCardQueue.process('get_identify_card', OrcService.getIdentifyCard);
