import Joi from 'joi';

import { type } from '../../../constants/device_token';

export const registerSchema = Joi.object().keys({
  phone_number: Joi.string().regex(/^[0-9]{10,11}$/),
  password: Joi.string().required().min(8).max(50),
  name: Joi.string().required().max(255),
  device_token: Joi.string().optional(),
  type: Joi.string()
    .valid(...Object.values(type))
    .when('device_token', { is: Joi.string(), then: Joi.required() }),
});
