import Joi from 'joi';

export const approveEstimateCostSchema = Joi.object().keys({
  total_time: Joi.number().integer().required(),
  cost: Joi.number().integer(),
  message_sid: Joi.string().required(),
});
