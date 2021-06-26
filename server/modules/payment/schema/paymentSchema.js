import Joi from 'joi';

export const paymentSchema = Joi.object().keys({
  phone_number: Joi.string().required(),
  token: Joi.string().required(),
});

export const confirmPaymentSchema = Joi.object().keys({
  partnerCode: Joi.string().required(),
  accessKey: Joi.string().required(),
  amount: Joi.number().required().min(0),
  partnerRefId: Joi.string().required(),
  transType: Joi.string().required(),
  momoTransId: Joi.string().required(),
  status: Joi.number().required(),
  message: Joi.string().required(),
  responseTime: Joi.number().required(),
  signature: Joi.string().required(),
  storeId: Joi.string(),
});
