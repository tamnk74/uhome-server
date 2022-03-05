import Joi from 'joi';

export const surveySchema = Joi.object().keys({
  start_time: Joi.date().greater('now').required(),
  total_time: Joi.number().min(0).required(),
  reason: Joi.string().required(),
});
