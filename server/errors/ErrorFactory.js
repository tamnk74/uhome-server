import httpStatus from 'http-status';
import errors from './data';
import BadRequestError from './BadRequestError';
import ForbidenError from './ForbidenError';
import InternalServerError from './InternalServerError';
import NotfoundError from './NotfoundError';
import UnauthorizedError from './UnauthorizedError';
import ValidationError from './ValidationError';

class ErrorFactory {
  getError = (code = 'ERR-0500') => {
    const error = errors[code];
    if (!error) {
      return new InternalServerError({ detail: code });
    }

    switch (error.status) {
      case httpStatus.BAD_REQUEST:
        return new BadRequestError({ code, detail: error.detail });
      case httpStatus.FORBIDDEN:
        return new ForbidenError({ code, detail: error.detail });
      case httpStatus.NOT_FOUND:
        return new NotfoundError({ code, detail: error.detail });
      case httpStatus.UNAUTHORIZED:
        return new UnauthorizedError({ code, detail: error.detail });
      default:
        return new InternalServerError({
          detail: error.detail,
        });
    }
  };

  getJoiErrors = (joiErrors = []) => {
    const errors = joiErrors.map((joiError) => ({
      message: joiError.message,
      field: joiError.context.key,
    }));
    return new ValidationError({ code: 'ERR-0422', errors });
  };
}

const errorFactory = new ErrorFactory();

export default errorFactory;
