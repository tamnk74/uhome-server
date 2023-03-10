import Joi from 'joi';
import { paymentMethod } from '../../../constants';

export const updateIssueSchema = Joi.object().keys({
  title: Joi.string().max(2048),
  location: Joi.string().max(1048),
  attachment_ids: Joi.array().items(Joi.string()),
  lat: Joi.number(),
  lon: Joi.number(),
  payment_method: Joi.string().valid(...Object.values(paymentMethod)),
});
