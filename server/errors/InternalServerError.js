import httpStatus from 'http-status';
import ApiError from './ApiError';

class InternalServerError extends ApiError {
  constructor({
    code = 'ERR-0500',
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
    detail = '',
  }) {
    super({
      message,
      code,
      detail,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      title: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
    });
  }
}

export default InternalServerError;
