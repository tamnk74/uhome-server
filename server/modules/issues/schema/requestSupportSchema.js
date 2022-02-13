import Joi from 'joi';

export const requestSupportSchema = Joi.object().keys({
  message: Joi.string().allow(null, ''),
  lat: Joi.number().required(),
  lon: Joi.number().required(),
});
