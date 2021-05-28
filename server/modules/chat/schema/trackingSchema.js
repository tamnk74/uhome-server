import Joi from 'joi';

export const trackingSchema = Joi.object().keys({
  content: Joi.string(),
  attachment_ids: Joi.array().items(Joi.string()).required(),
  message_sid: Joi.string().required(),
});
