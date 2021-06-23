import Joi from 'joi';

export const paymentSchema = Joi.object().keys({
  phone_number: Joi.string().required(),
  token: Joi.string().required(),
  amount: Joi.number().required(),
});
