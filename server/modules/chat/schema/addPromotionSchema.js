import Joi from 'joi';

export const addPromotionSchema = Joi.object().keys({
  attachment_ids: Joi.array().items(Joi.string()).required(),
});
