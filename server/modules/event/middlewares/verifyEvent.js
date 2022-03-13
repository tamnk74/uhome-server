import { saleEventTypes, eventStatuses } from '../../../constants';
import Event from '../../../models/event';
import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyEvent = async (req, res, next) => {
  try {
    const saleEvent = await Event.findOne({
      where: {
        code: req.params.code,
      },
      include: Event.buildRelation(),
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

    if (saleEvent.limit !== -1) {
      const userEventCount = await Issue.count({
        where: {
          createdBy: req.user.id,
          eventId: saleEvent.id,
          status: eventStatuses.INACTIVE,
        },
      });
      if (userEventCount >= saleEvent.limit) {
        throw errorFactory.getError('EVSL-0004');
      }
    }

    req.saleEvent = saleEvent;
    return next();
  } catch (e) {
    return next(e);
  }
};
