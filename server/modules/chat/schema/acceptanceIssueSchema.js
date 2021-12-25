import Joi from 'joi';

export const acceptanceIssueSchema = Joi.object().keys({
  rate: Joi.number().min(0).max(5).required(),
  comment: Joi.string().max(2048),
  message_sid: Joi.string().required(),
});
