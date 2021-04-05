import Joi from 'joi';
import { command } from '../../../constants';

export const commandChatSchema = Joi.object().keys({
  command_name: Joi.string().valid(...Object.values(command)),
  start_time: Joi.date().when('command_name', {
    is: Joi.string().valid(command.SUBMIT_ESTIMATION),
    then: Joi.required(),
    otherwise: Joi.date().optional(),
  }),
  total_time: Joi.number()
    .integer()
    .when('command_name', {
      is: Joi.string().valid(command.SUBMIT_ESTIMATION),
      then: Joi.required(),
      otherwise: Joi.number().integer().optional(),
    }),
  total_cost: Joi.number()
    .integer()
    .when('command_name', {
      is: Joi.string().valid(command.INFORM_MATERIAL_COST),
      then: Joi.required(),
      otherwise: Joi.number().integer().optional(),
    }),
  materials: Joi.string().when('command_name', {
    is: Joi.string().valid(command.INFORM_MATERIAL_COST),
    then: Joi.required(),
    otherwise: Joi.string().optional(),
  }),
});
