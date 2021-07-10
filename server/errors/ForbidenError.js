import httpStatus from 'http-status';
import ApiError from './ApiError';

class ForbiddenError extends ApiError {
  constructor({ code = 'ERR-0403', message = httpStatus[httpStatus.FORBIDDEN], detail = '' }) {
    super({
      message,
      code,
      detail,
      status: httpStatus.FORBIDDEN,
      title: httpStatus[httpStatus.FORBIDDEN],
    });
  }
}

export default ForbiddenError;
