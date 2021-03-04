import user from './user.json';
import event from './event.json';
import common from './common.json';
import joi from './joi.json';

export default {
  ...joi,
  ...common,
  ...user,
  ...event,
};
