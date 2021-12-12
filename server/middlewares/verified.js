import errorFactory from '../errors/ErrorFactory';
import User from '../models/user';
import { status } from '../constants';

export default async (req, res, next) => {
  const { user } = req;
  if (user.status === status.IN_ACTIVE) {
    return next(errorFactory.getError('USER-0001'));
  }
  if (!user.verified_at) {
    const updatedUser = await User.findByPk(user.id);
    if (!updatedUser.verifiedAt) {
      return next(errorFactory.getError('USER-0003'));
    }
  }
  return next();
};
