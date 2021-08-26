import Joi from 'joi';

import { paymentMethod } from '../../../constants';

export const withdrawSchema = Joi.object().keys({
  amount: Joi.number().required().min(0),
  payment_method: Joi.string().valid(Object.values(paymentMethod)).required(),
});
