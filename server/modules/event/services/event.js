import { Op } from 'sequelize';
import day from 'dayjs';
import Event from '../../../models/event';

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
}
