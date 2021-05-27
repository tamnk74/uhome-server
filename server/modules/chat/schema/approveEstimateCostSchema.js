import Joi from 'joi';

export const approveEstimateCostSchema = Joi.object().keys({
  total_time: Joi.number().integer().required(),
  cost: Joi.number().integer().required(),
  message_sid: Joi.string().required(),
});
