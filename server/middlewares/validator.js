import Joi from 'joi';
import errorFactory from '../errors/ErrorFactory';
import { objectToCamel } from '../helpers/Util';

export default (schema, type = 'body') => (req, res, next) => {
  const body = req[type];
  const { error } = Joi.validate(body, schema);
  if (error == null) {
    req.body = objectToCamel(req.body);
    return next();
  }

  return next(errorFactory.getJoiErrors(error.details));
};
