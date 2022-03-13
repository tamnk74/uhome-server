import Joi from 'joi';
import { issueType, unitTime } from '../../../constants/issue';

const workerTimeItem = Joi.object().keys({
  start_time: Joi.date().required(),
  end_time: Joi.date().greater(Joi.ref('start_time')).required(),
});

export const estimationSchema = Joi.object().keys({
  total_time: Joi.number()
    .required()
    .when('type', {
      is: issueType.HOTFIX,
      then: Joi.number().max(8),
      otherwise: Joi.number().min(0),
    }),
  num_of_worker: Joi.number().integer().min(1).default(1),
  working_times: Joi.array().items(workerTimeItem).required(),
  type: Joi.string()
    .valid(...Object.values(issueType))
    .required(),
  unit_time: Joi.string()
    .valid(...Object.values(unitTime))
    .required(),
});
