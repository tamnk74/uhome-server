import Joi from 'joi';

export const loginAppleSchema = Joi.object().keys({
  code: Joi.string().required(),
  email: Joi.string().allow(null, ''),
  name: Joi.string().allow(null, ''),
});
