import Joi from 'joi';
import { issueType, unitTime } from '../../../constants/issue';

const workerTimeItem = Joi.object().keys({
  start_time: Joi.date().required(),
  end_time: Joi.date().required(),
});

export const approveEstimateTimeSchema = Joi.object().keys({
  total_time: Joi.number()
    .required()
    .when('type', {
      is: issueType.HOTFIX,
      then: Joi.number().integer().max(8),
      otherwise: Joi.number().integer().min(0),
    }),
  worker_fee: Joi.number().integer().required(),
  customer_fee: Joi.number().integer().required(),
  discount: Joi.number().integer(),
  message_sid: Joi.string().required(),
  num_of_worker: Joi.number().integer().min(1).default(1),
  working_times: Joi.array().items(workerTimeItem).required(),
  type: Joi.string()
    .valid(...Object.values(issueType))
    .required(),
  unit_time: Joi.string()
    .valid(...Object.values(unitTime))
    .required(),
});
