import Joi from 'joi';

export const resetPasswordSchema = Joi.object().keys({
  code: Joi.string().required().min(8).max(50),
  password: Joi.string().required().min(8).max(50),
  password_confirmation: Joi.any().valid(Joi.ref('password')).required(),
});
