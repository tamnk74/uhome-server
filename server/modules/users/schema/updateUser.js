import Joi from 'joi';

export const updateUserSchema = Joi.object().keys({
  name: Joi.string().max(255),
  birthday: Joi.date(),
  address: Joi.string().max(255),
  longitude: Joi.number(),
  latitude: Joi.number(),
});
