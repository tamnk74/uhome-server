import Event from '../../../models/event';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return next(errorFactory.getError('EVSL-0001'));
    }

    req.event = event;
    return next();
  } catch (e) {
    return next(e);
  }
};
