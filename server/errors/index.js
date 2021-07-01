import httpStatus from 'http-status';
import { sentryConfig, env } from '../config';
import InternalServerError from './InternalServerError';
import BadRequestError from './BadRequestError';
import ValidationError from './ValidationError';
import ForbidenError from './ForbidenError';
import NotfoundError from './NotfoundError';
import UnauthorizedError from './UnauthorizedError';
import ApiError from './ApiError';
import errorFactory from './ErrorFactory';

export const handleError = (err, req, res, next) => {
  switch (err.constructor) {
    case BadRequestError:
    case ValidationError:
    case ForbidenError:
    case NotfoundError:
    case UnauthorizedError:
    case ApiError:
      break;
    default:
      err = errorFactory.getError(err.message);
      break;
  }
  const status = err.status || httpStatus.INTERNAL_SERVER_ERROR;

  const response = {
    code: err.code,
    message: err.message,
    errors: err.errors || [],
  };
  console.error(err);
  if (env !== 'production') {
    response.stack = err.stack;
  }

  if (err instanceof InternalServerError || status === httpStatus.INTERNAL_SERVER_ERROR) {
    sentryConfig.Sentry.captureException(err);
  }

  return res.status(status).send(response);
};
