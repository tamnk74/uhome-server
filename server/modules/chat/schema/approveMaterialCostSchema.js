import Joi from 'joi';

export const approveMaterialCostSchema = Joi.object().keys({
  total_cost: Joi.number().integer().min(0).required(),
  materials: Joi.string().required(),
  message_sid: Joi.string().required(),
});
