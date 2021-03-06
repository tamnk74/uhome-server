import Joi from 'joi';

export const loginFbSchema = Joi.object().keys({
  access_token: Joi.string().required(),
});
