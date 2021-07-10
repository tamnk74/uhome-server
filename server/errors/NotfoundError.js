import httpStatus from 'http-status';
import ApiError from './ApiError';

class NotFoundError extends ApiError {
  constructor({ message = httpStatus[httpStatus.NOT_FOUND], code = 'ERR-0404', detail = '' }) {
    super({
      message,
      code,
      detail,
      status: httpStatus.NOT_FOUND,
      title: httpStatus[httpStatus.NOT_FOUND],
    });
  }
}

export default NotFoundError;
