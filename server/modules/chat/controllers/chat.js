import { objectToCamel, objectToSnake } from '../../../helpers/Util';
import ChatService from '../services/chat';

export default class ChatController {
  static async create(req, res, next) {
    try {
      const issue = await ChatService.create(req.user, objectToCamel(req.body));
      return res.status(201).json(objectToSnake(issue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }
}
