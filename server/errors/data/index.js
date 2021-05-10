import user from './user.json';
import attachment from './attachment.json';
import issue from './issue.json';
import common from './common.json';
import joi from './joi.json';
import chat from './chat.json';

export default {
  ...joi,
  ...common,
  ...user,
  ...issue,
  ...attachment,
  ...chat,
};
