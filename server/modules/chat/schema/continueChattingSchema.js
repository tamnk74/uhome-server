import Joi from 'joi';

export const continueChattingchema = Joi.object().keys({
  message_sid: Joi.string().required(),
});
