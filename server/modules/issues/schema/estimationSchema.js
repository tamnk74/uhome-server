import Joi from 'joi';

export const estimationSchema = Joi.object().keys({
  start_time: Joi.date().required(),
  end_time: Joi.date().required(),
  total_time: Joi.number().integer().min(0).required(),
});
