import httpStatus from 'http-status';
import ApiError from './ApiError';

class BadRequestError extends ApiError {
  constructor({
    message = httpStatus[httpStatus.BAD_REQUEST],
    code = 'ERR-0400',
    detail = '',
    errors = [],
  }) {
    super({
      message,
      code,
      detail,
      status: httpStatus.BAD_REQUEST,
      title: httpStatus[httpStatus.BAD_REQUEST],
      errors,
    });
  }
}

export default BadRequestError;
