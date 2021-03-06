import Joi from 'joi';

export const loginZaloSchema = Joi.object().keys({
  code: Joi.string().required(),
});
