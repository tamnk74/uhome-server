import Joi from 'joi';

export const phoneNumberSchema = Joi.object().keys({
  phone_number: Joi.string().regex(/^[0-9]{10,11}$/),
});
