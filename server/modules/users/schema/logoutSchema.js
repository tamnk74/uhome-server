import Joi from 'joi';

export const logoutSchema = Joi.object().keys({
  device_id: Joi.string().required(),
});
