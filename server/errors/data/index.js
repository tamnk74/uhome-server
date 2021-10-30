import user from './user.json';
import attachment from './attachment.json';
import issue from './issue.json';
import common from './common.json';
import joi from './joi.json';
import chat from './chat.json';
import payment from './payment.json';
import saleEvent from './event-sale.json';

export default {
  ...joi,
  ...common,
  ...user,
  ...issue,
  ...attachment,
  ...chat,
  ...payment,
  ...saleEvent,
};
