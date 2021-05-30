import Joi from 'joi';

export const refreshTokenSchema = Joi.object().keys({
  refresh_token: Joi.string().required(),
});
