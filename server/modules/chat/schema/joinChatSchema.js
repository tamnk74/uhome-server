import Joi from 'joi';

export const joinChatSchema = Joi.object().keys({
  issue_id: Joi.string().max(127).required(),
});
