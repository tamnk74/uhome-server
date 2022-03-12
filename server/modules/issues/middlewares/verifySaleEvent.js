import { saleEventTypes } from '../../../constants';
import Event from '../../../models/event';
import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';

export const verifySaleEvent = async (req, res, next) => {
  try {
    if (req.body.eventId) {
      const saleEvent = await Event.findByPk(req.body.eventId, {
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

      if (+saleEvent.limit !== -1) {
        const usedEventsQty = await Issue.count({
          where: {
            createdBy: req.user.id,
            eventId: saleEvent.id,
          },
        });

        if (usedEventsQty >= +saleEvent.limit) {
          throw errorFactory.getError('EVSL-0004');
        }
      }

      const categoryIds = await saleEvent.categories.map((category) => category.id);

      if (
        categoryIds.length &&
        !req.body.categoryIds.some((categoryId) => categoryIds.includes(categoryId))
      ) {
        throw errorFactory.getError('EVSL-0003');
      }

      req.saleEvent = saleEvent;
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
