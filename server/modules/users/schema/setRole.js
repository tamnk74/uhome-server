import Joi from 'joi';

import { userRoles } from '../../../constants';

export const setRoleSchema = Joi.object().keys({
  role: Joi.string()
    .valid(...Object.values(userRoles))
    .required(),
});
