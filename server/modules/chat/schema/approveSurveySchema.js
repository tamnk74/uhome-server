import Joi from 'joi';

export const approveSurveySchema = Joi.object().keys({
  message_sid: Joi.string().required(),
});
