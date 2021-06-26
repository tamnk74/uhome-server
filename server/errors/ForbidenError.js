import httpStatus from 'http-status';
import ApiError from './ApiError';

class ForbiddenError extends ApiError {
  constructor({ message = httpStatus[httpStatus.FORBIDDEN], detail = '' }) {
    super({
      message,
      code: 'ER-0403',
      detail,
      status: httpStatus.FORBIDDEN,
      title: httpStatus[httpStatus.FORBIDDEN],
    });
  }
}

export default ForbiddenError;
