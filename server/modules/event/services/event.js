import { Op } from 'sequelize';
import day from 'dayjs';
import Event from '../../../models/event';
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
