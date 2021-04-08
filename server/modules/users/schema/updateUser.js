import Joi from 'joi';
import { gender } from '../../../constants/user';

export const updateUserSchema = Joi.object().keys({
  name: Joi.string().max(255),
  birthday: Joi.date(),
  address: Joi.string().max(255),
  longitude: Joi.number(),
  latitude: Joi.number(),
  gender: Joi.string().valid(...Object.values(gender)),
});
