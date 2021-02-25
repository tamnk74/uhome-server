import joiMapping from './data/joi.json';
import errors from './data';
import ApiError from './ApiError';
import { env } from '../config';

class ErrorFactory {
  getError = (code) => {
    const error = errors[code];

    if (error) {
      return new ApiError({
        code,
        ...error,
      });
    }
    if (env !== 'production') {
      console.log(env, code);
    }
    return new ApiError({
      ...errors['ERR-0500'],
      code: 'ERR-0500',
      detail: code || 'Internal Server Error',
    });
  };

  getJoiErrors = (joiErrors = []) => {
    if (env !== 'production') {
      console.log(env, joiErrors);
    }
    return joiErrors.map((joiError) => {
      const {
        type,
        context: { label: key },
      } = joiError;

      const code = joiMapping[`${key}.${type}`];
      const error = errors[code];
      if (error) {
        return new ApiError({
          code,
          ...error,
        });
      }

      // Handle undefined error
      return new ApiError({
        code: 'ERR-0422',
        ...errors['ERR-0422'],
      });
    });
  };
}

const errorFactory = new ErrorFactory();

export default errorFactory;
