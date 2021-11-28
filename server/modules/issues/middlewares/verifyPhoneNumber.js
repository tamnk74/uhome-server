import errorFactory from '../../../errors/ErrorFactory';
import User from '../../../models/user';

export const verifyPhoneNumber = async (req, res, next) => {
  try {
    if (req.user.phoneNumber) {
      return next();
    }
    const user = await User.findByPk(req.user.id);
    if (!user || !user.phoneNumber) {
      throw errorFactory.getError('USER-1004');
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
