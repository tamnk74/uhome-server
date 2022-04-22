import { googleMap } from '../../../helpers/GoogleMap';
import errorFactory from '../../../errors/ErrorFactory';
import Province from '../../../models/province';

export const verifyLocation = async (req, res, next) => {
  try {
    const { lat, lon } = req.body;
    const shortNames = await googleMap.getProvince({
      lat,
      lng: lon,
    });

    const province = await Province.findOne({
      where: {
        code: shortNames,
      },
      status: Province.IS_ENABLED,
    });

    if (!province) {
      return next(errorFactory.getError('ISSUE-0415'));
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
