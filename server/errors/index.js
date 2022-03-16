import httpStatus from 'http-status';
import { sentryConfig } from '../config';
import InternalServerError from './InternalServerError';
import BadRequestError from './BadRequestError';
import ValidationError from './ValidationError';
import ForbidenError from './ForbidenError';
import NotfoundError from './NotfoundError';
import UnauthorizedError from './UnauthorizedError';
import ApiError from './ApiError';
import errorFactory from './ErrorFactory';

export const handleError = async (err, req, res, next) => {
  let error = null;
  switch (err.constructor) {
    case BadRequestError:
    case ValidationError:
    case ForbidenError:
    case NotfoundError:
    case UnauthorizedError:
    case ApiError:
      error = err;
      break;
    default:
      error = errorFactory.getError(err.message);
      break;
  }

  const status = error.status || httpStatus.INTERNAL_SERVER_ERROR;

  const response = {
    code: error.code,
    message: error.message,
    errors: error.errors || [],
  };

  if (
    process.env.ENV !== 'local' &&
    (error instanceof InternalServerError || status === httpStatus.INTERNAL_SERVER_ERROR)
  ) {
    sentryConfig.Sentry.captureException(err);
  }

  return res.status(status).send(response);
};
