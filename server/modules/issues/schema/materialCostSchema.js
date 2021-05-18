import Joi from 'joi';

export const materialCostSchema = Joi.object().keys({
  total_cost: Joi.number().integer().required(),
  materials: Joi.string().required()
});
