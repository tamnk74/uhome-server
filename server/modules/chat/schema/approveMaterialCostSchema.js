import Joi from 'joi';

const materialItem = Joi.object().keys({
  cost: Joi.number().integer().min(0).required(),
  material: Joi.string().required(),
});

export const approveMaterialCostSchema = Joi.object().keys({
  materials: Joi.array().items(materialItem).required(),
  message_sid: Joi.string().required(),
});
