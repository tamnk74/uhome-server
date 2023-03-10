import Joi from 'joi';
import { gender } from '../../../constants/user';

export const updateUserSchema = Joi.object().keys({
  name: Joi.string().max(255),
  birthday: Joi.date(),
  address: Joi.string().max(255),
  lon: Joi.number(),
  lat: Joi.number(),
  gender: Joi.string().valid(...Object.values(gender)),
});

export const updatePhoneNumberSchema = Joi.object().keys({
  phone_number: Joi.string()
    .regex(/^[0-9]{10,11}$/)
    .required(),
});
