import Joi from 'joi';

export const loginAppleSchema = Joi.object().keys({
  code: Joi.string().required(),
  email: Joi.string().required(),
  name: Joi.string().required(),
});
