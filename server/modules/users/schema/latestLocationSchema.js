import Joi from 'joi';

export const latestLocationSchema = Joi.object().keys({
  lat: Joi.number().required(),
  lon: Joi.number().required(),
});
