import Joi from 'joi';

export const updatePasswordSchema = Joi.object().keys({
  current_password: Joi.string().required().min(8).max(50),
  password: Joi.string().required().min(8).max(50),
  password_confirmation: Joi.any().valid(Joi.ref('password')).required(),
});
