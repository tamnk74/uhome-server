import httpStatus from 'http-status';
import ApiError from './ApiError';

class InternalServerError extends ApiError {
  constructor({ message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR], detail = '' }) {
    super({
      message,
      code: 'ER-0500',
      detail,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      title: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
    });
  }
}

export default InternalServerError;
