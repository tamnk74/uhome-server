import httpStatus from 'http-status';
import ApiError from './ApiError';

class UnauthorizedError extends ApiError {
  constructor({ code = 'ERR-0401', message = httpStatus[httpStatus.UNAUTHORIZED], detail = '' }) {
    super({
      message,
      code,
      detail,
      status: httpStatus.UNAUTHORIZED,
      title: httpStatus[httpStatus.UNAUTHORIZED],
    });
  }
}

export default UnauthorizedError;
