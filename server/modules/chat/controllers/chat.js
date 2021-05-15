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

  static async sendCommand(req, res, next) {
    try {
      await ChatService.sendCommand(req.chatChannel, req.user, req.body);
      return res.status(204).json();
    } catch (e) {
      return next(e);
    }
  }

  static async confirmRequest(req, res, next) {
    try {
      const receiveIssue = await ChatService.confirmRequest({
        chatChannel: req.chatChannel,
        user: req.user,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async getToken(req, res, next) {
    try {
      const data = await ChatService.getToken(req.chatChannel, req.user);
      return res.status(200).json(objectToSnake(data));
    } catch (e) {
      return next(e);
    }
  }
}
