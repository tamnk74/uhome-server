import httpStatus from 'http-status';
import ApiError from './ApiError';

class ValidationError extends ApiError {
  constructor({
    message = httpStatus[httpStatus.UNPROCESSABLE_ENTITY],
    code = 'ER-0422',
    detail = '',
    errors = [],
  }) {
    super({
      message,
      code,
      detail,
      status: httpStatus.UNPROCESSABLE_ENTITY,
      title: httpStatus[httpStatus.UNPROCESSABLE_ENTITY],
    });
    this.errors = errors;
  }
}

export default ValidationError;
