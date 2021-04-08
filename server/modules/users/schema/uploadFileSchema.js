import Joi from 'joi';
import { fileType } from '../../../constants/user';

export const uploadFileschema = Joi.object().keys({
  type: Joi.string().valid(...Object.values(fileType)),
});
