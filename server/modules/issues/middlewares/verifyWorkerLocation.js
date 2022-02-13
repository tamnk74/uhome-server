import { googleMap } from '../../../helpers';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyWorkerLocation = async (req, res, next) => {
  const { lat, lon } = req.body;

  if (process.env.NODE_ENV === 'qa') {
    return next();
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
