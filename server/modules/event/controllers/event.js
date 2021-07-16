import { objectToSnake } from '../../../helpers/Util';
import { EventService } from '../services';
import Pagination from '../../../helpers/Pagination';

export default class EventController {
  static async index(req, res, next) {
    try {
      const pagination = new Pagination(req);
      const events = await EventService.getEvents(req);
      pagination.setTotal(events.count);
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: events.rows.map((event) => {
          const item = event.toJSON();
          return objectToSnake(item);
        }),
      });
    } catch (e) {
      return next(e);
    }
  }
}
