import errorFactory from '../errors/ErrorFactory';
import { status } from '../constants';

export default (req, res, next) => {
  const { user } = req;
  if (user.status === status.IN_ACTIVE) {
    return next(errorFactory.getError('USER-0001'));
  }
  return next();
};
