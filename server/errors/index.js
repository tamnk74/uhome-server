import { Error as JSONAPIError } from 'jsonapi-serializer';
import { ValidationError } from 'express-validation';
import errorFactory from './ErrorFactory';
import ApiError from './ApiError';

export const handleError = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(422).json(
      new JSONAPIError(
        err.errors.map((error) => ({
          code: 'ERR-0422',
          title: 'Invalid data',
          detail: error.messages[0],
        }))
      )
    );
  }

  if (err instanceof ApiError) {
    return res.status(err.status).send({
      errors: [err],
    });
  }
  if (Array.isArray(err) && err.length) {
    return res.status(err[0].status).send({
      errors: err,
    });
  }
  console.log(err);
  const error = errorFactory.getError(err.message);
  return res.status(error.status).send(new JSONAPIError(error));
};
