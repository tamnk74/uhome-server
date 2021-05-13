import Joi from 'joi';

export const cancelIssueSchema = Joi.object().keys({
  reason: Joi.string().max(2048).required(),
});
