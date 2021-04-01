import Joi from 'joi';

export const createChatSchema = Joi.object().keys({
  issue_id: Joi.string().max(127).required(),
  user_id: Joi.string().max(127).required(),
});
