import Joi from 'joi';

const materialItem = Joi.object().keys({
  cost: Joi.number().integer().min(0).required(),
  material: Joi.string().required(),
});

export const materialCostSchema = Joi.object().keys({
  materials: Joi.array().items(materialItem).required(),
});
