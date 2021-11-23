import { saleEventTypes, eventStatuses } from '../../../constants';
import Event from '../../../models/event';
import UserEvent from '../../../models/userEvent';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyEvent = async (req, res, next) => {
  try {
    const saleEvent = await Event.findOne({
      where: {
        code: req.params.code,
      },
    });

    if (!saleEvent) {
      throw errorFactory.getError('EVSL-0001');
    }
    if (saleEvent.isExpired()) {
      throw errorFactory.getError('EVSL-0002');
    }

    if (saleEvent.type === saleEventTypes.BONUS) {
      throw errorFactory.getError('EVSL-0003');
    }

    if (saleEvent.type === saleEventTypes.VOUCHER) {
      const userEvent = await UserEvent.findOne({
        where: {
          userId: req.user.id,
          eventId: saleEvent.id,
          status: eventStatuses.INACTIVE,
        },
      });
      if (!userEvent) {
        throw errorFactory.getError('EVSL-0004');
      }
    }

    req.saleEvent = saleEvent;
    return next();
  } catch (e) {
    return next(e);
  }
};
