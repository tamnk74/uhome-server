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

  static async myEvents(req, res, next) {
    try {
      const events = await EventService.getMyEvents(req.user, req.query);
      return res.status(200).json(
        events.rows.map((event) => {
          const item = event.toJSON();
          return objectToSnake(item);
        })
      );
    } catch (e) {
      return next(e);
    }
  }

  static async validate(req, res, next) {
    try {
      const isValid = await EventService.validate(req);
      return res.status(200).json({
        isValid,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { file } = req;

      await EventService.update(id, data, file);

      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  }
}
