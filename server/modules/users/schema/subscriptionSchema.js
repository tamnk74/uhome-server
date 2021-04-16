import Joi from 'joi';

export const subscriptionSchema = Joi.object().keys({
  device_token: Joi.string().required(),
});
