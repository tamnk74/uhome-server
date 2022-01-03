import Joi from 'joi';

export const approveEstimateTimeSchema = Joi.object().keys({
  message_sid: Joi.string().required(),
});
