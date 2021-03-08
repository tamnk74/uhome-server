import Joi from 'joi';

export const verifyCodeSchema = Joi.object().keys({
  verify_code: Joi.string().required().length(6),
});
