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

  static async getToken(req, res, next) {
    try {
      const data = await ChatService.getToken(req.chatChannel, req.user);
      return res.status(200).json(objectToSnake(data));
    } catch (e) {
      return next(e);
    }
  }

  static async requestCommand(req, res, next) {
    try {
      await ChatService.requestCommand(req.params.type, req.chatChannel, req.user);
      return res.status(204).json();
    } catch (e) {
      return next(e);
    }
  }

  static async approveEstimateTime(req, res, next) {
    try {
      await ChatService.approveEstimateTime({
        chatChannel: req.chatChannel,
        user: req.user,
        data: req.body,
      });
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async approveMaterialCost(req, res, next) {
    try {
      await ChatService.approveMaterialCost({
        chatChannel: req.chatChannel,
        user: req.user,
        data: req.body,
      });
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async trakingProgress(req, res, next) {
    try {
      await ChatService.trakingProgress({
        chatChannel: req.chatChannel,
        user: req.user,
        data: req.body,
      });
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }
}
