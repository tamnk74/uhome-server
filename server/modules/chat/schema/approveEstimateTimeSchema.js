import Joi from 'joi';

export const approveEstimateTimeSchema = Joi.object().keys({
  start_time: Joi.date().required(),
  end_time: Joi.date().required(),
  total_time: Joi.number().integer().min(0).required(),
  cost: Joi.number().integer().required(),
  message_sid: Joi.string().required(),
});
