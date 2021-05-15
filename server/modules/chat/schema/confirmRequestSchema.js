import Joi from 'joi';

export const confirmRequestSchema = Joi.object().keys({
  start_time: Joi.date().required(),
  total_time: Joi.number().integer().required(),
  cost: Joi.number().integer(),
  materials: Joi.string(),
});
