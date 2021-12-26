import { googleMap } from '../../../helpers/GoogleMap';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyLocation = async (req, res, next) => {
  try {
    const { lat, lon } = req.body;
    const allowedProvinces = ['Đà Nẵng', 'Quang Nam Province', 'Quảng Nam', 'Da Nang'];
    const province = await googleMap.getProvince({
      lat,
      lng: lon,
    });
    if (!allowedProvinces.includes(province)) {
      return next(errorFactory.getError('ISSUE-0415'));
    }
    return next();
  } catch (e) {
    return next(e);
  }
};
