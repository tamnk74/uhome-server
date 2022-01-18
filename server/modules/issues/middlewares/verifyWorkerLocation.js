import { googleMap } from '../../../helpers';
import errorFactory from '../../../errors/ErrorFactory';
import User from '../../../models/user';

export const verifyWorkerLocation = async (req, res, next) => {
  const { user } = req;
  const updatedUser = await User.findByPk(user.id);

  if (process.env.NODE_ENV === 'qa') {
    return next();
  }

  if (!updatedUser) {
    return next(errorFactory.getError('USER-0002'));
  }

  const { lat, lon } = updatedUser;
  if (!lat || !lon) {
    return next(errorFactory.getError('ISSUE-0416'));
  }

  const allowedProvinces = ['Đà Nẵng', 'Quang Nam Province', 'Quảng Nam', 'Da Nang'];
  const province = await googleMap.getProvince({
    lat,
    lng: lon,
  });
  if (!allowedProvinces.includes(province)) {
    return next(errorFactory.getError('ISSUE-0415'));
  }
  return next();
};
