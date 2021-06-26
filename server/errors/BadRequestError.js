import httpStatus from 'http-status';
import ApiError from './ApiError';

class BadRequestError extends ApiError {
  constructor({ message = httpStatus[httpStatus.BAD_REQUEST], code = 'ER-0400', detail = '' }) {
    super({
      message,
      code,
      detail,
      status: httpStatus.BAD_REQUEST,
      title: httpStatus[httpStatus.BAD_REQUEST],
    });
  }
}

export default BadRequestError;
