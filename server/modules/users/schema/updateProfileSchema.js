import Joi from 'joi';
import { gender } from '../../../constants/user';

export const updateProfileSchema = Joi.object().keys({
  birthday: Joi.date(),
  gender: Joi.string().valid(...Object.values(gender)),
});
