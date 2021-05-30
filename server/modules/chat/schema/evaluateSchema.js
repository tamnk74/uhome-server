import Joi from 'joi';

export const evaluateIssueSchema = Joi.object().keys({
  rate: Joi.number().min(0).max(5).required(),
  comment: Joi.string().max(2048),
  message_sid: Joi.string().required(),
});
