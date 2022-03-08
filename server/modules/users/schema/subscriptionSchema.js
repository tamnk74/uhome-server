import Joi from 'joi';

export const subscriptionSchema = Joi.object().keys({
  device_token: Joi.string().required(),
  device_id: Joi.string().required(),
});
