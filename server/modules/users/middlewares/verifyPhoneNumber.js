import errorFactory from 'errors/ErrorFactory';
import User from '../../../models/user';

export const verifyPhoneNumber = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        phoneNumber: req.body.phoneNumber,
      },
    });

    if (user) {
      throw errorFactory.getError('USER-1003');
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
