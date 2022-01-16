import Joi from 'joi';

export const uploadVideoSchema = Joi.object().keys({
  link: Joi.string().required(),
});
