import Joi from 'joi';

export const estimationSchema = Joi.object().keys({
  start_time: Joi.date().required(),
  end_time: Joi.date().required().greater(Joi.ref('start_time')),
  total_time: Joi.number().integer().min(0).required(),
  num_of_worker: Joi.number().integer().min(1).default(1),
});
