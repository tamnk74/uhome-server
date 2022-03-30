import _ from 'lodash';
import errorFactory from '../../../errors/ErrorFactory';
import UserProfile from '../../../models/userProfile';
import { minAccountBalance } from '../../../config';

export const limitAccountBalance = async (req, res, next) => {
  try {
    const { user } = req;
    const userProfile = await UserProfile.findOne({
      where: {
        userId: _.get(user, 'id'),
      },
    });

    if (_.get(userProfile, 'accountBalance', minAccountBalance - 1) < minAccountBalance) {
      return next(errorFactory.getError('PAY-0411'));
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
