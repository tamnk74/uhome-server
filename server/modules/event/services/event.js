import { Op } from 'sequelize';
import day from 'dayjs';
import { saleEventTypes, eventStatuses } from 'constants';
import errorFactory from 'errors/ErrorFactory';
import Event from '../../../models/event';
import UserEvent from '../../../models/userEvent';
import Uploader from '../../../helpers/Uploader';

export class EventService {
  static async getEvents(req) {
    const { limit, offset, from, to } = req.query;
    const options = Event.buildOptionQuery(req.query);

    if (from) {
      options.where.from = {
        [Op.gte]: day(from),
      };
    }

    if (to) {
      options.where.to = {
        [Op.lte]: day(to),
      };
    }

    return Event.findAndCountAll({
      ...options,
      include: Event.buildRelation(),
      attributes: Event.baseAttibutes,
      limit,
      offset,
    });
  }

  static async getMyEvents(user, params) {
    return Event.findAndCountAll({
      include: Event.buildRelation(),
      attributes: Event.baseAttibutes,
      where: Event.whereCondition(user, params),
      order: [
        ['to', 'ASC'],
        ['from', 'ASC'],
      ],
    });
  }

  static async validate({ event, user }) {
    if (event.type === saleEventTypes.VOUCHER) {
      const userEvent = await UserEvent.findOne({
        where: {
          userId: user.id,
          eventId: event.id,
          status: eventStatuses.INACTIVE,
        },
      });
      if (!userEvent) {
        throw errorFactory.getError('EVSL-0001');
      }
    }

    return (
      Object.values(saleEventTypes).includes(event.type) &&
      event.from <= new Date() &&
      event.to >= new Date() &&
      +event.status !== eventStatuses.INACTIVE
    );
  }

  static async update(id, data, file) {
    if (file) {
      const fileName = `${id}-${file.originalname}`;
      const path = `events/${fileName}`;

      await Uploader.upload(file, {
        path,
        'x-amz-meta-mimeType': file.mimetype,
        'x-amz-meta-size': file.size.toString(),
      });
      data.image = path;
    }

    return Event.update(data, {
      where: {
        id,
      },
    });
  }
}
