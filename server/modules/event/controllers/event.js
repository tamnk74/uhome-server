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

  static async getEvent(req, res, next) {
    try {
      return res.status(200).json(req.saleEvent.toJSON());
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

  static async getBanners(req, res, next) {
    try {
      const { user, query } = req;
      const pagination = new Pagination(req);
      const banners = await EventService.getBanner(user, query);
      pagination.setTotal(banners.count);
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: banners.rows.map((banner) => {
          const item = banner.toJSON();
          delete item.Event.EventScopes;
          return objectToSnake(item);
        }),
      });
    } catch (e) {
      return next(e);
    }
  }
}
