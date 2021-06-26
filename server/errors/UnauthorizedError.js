import httpStatus from 'http-status';
import ApiError from './ApiError';

class UnauthorizedError extends ApiError {
  constructor({ message = httpStatus[httpStatus.UNAUTHORIZED], detail = '' }) {
    super({
      message,
      code: 'ER-0401',
      detail,
      status: httpStatus.UNAUTHORIZED,
      title: httpStatus[httpStatus.UNAUTHORIZED],
    });
  }
}

export default UnauthorizedError;
