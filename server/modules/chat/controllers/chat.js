import { get } from 'lodash';
import { objectToCamel, objectToSnake } from '../../../helpers/Util';
import ChatService from '../services/chat';
import { roles } from '../../../constants';

export default class ChatController {
  static async create(req, res, next) {
    try {
      const { user, issue } = req;
      const { role } = user;
      if (role === roles.USER) {
        const result = await ChatService.create(user, issue, objectToCamel(req.body));
        return res.status(201).json(objectToSnake(result.toJSON()));
      }

      const result = await ChatService.joinChat(user, objectToCamel(req.body));
      return res.status(201).json(objectToSnake(result.toJSON()));
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
      const receiveIssue = await ChatService.requestCommand(
        req.params.type,
        req.chatChannel,
        req.user
      );

      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async getUploadVideoLink(req, res, next) {
    try {
      const result = await ChatService.getUploadVideoLink({
        chatChannel: req.chatChannel,
        user: req.user,
        thumbnail: req.thumbnail,
      });

      return res.status(200).json(objectToSnake(result));
    } catch (e) {
      return next(e);
    }
  }

  static async sendUploadVideoMessage(req, res, next) {
    try {
      const rs = await ChatService.sendUploadVideoMessage({
        chatChannel: req.chatChannel,
        user: req.user,
        link: req.body.link,
      });

      return res.status(200).json(rs);
    } catch (e) {
      return next(e);
    }
  }

  static async approveEstimateTime(req, res, next) {
    try {
      const receiveIssue = await ChatService.approveEstimateTime({
        chatChannel: req.chatChannel,
        user: req.user,
        data: req.body,
      });
      return res.status(200).json(receiveIssue);
    } catch (e) {
      return next(e);
    }
  }

  static async approveMaterialCost(req, res, next) {
    try {
      const receiveIssue = await ChatService.approveMaterialCost({
        chatChannel: req.chatChannel,
        user: req.user,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async trackingProgress(req, res, next) {
    try {
      const receiveIssue = await ChatService.trackingProgress({
        chatChannel: req.chatChannel,
        user: req.user,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async setRating(req, res, next) {
    try {
      const receiveIssue = await ChatService.setRating({
        user: req.user,
        chatChannel: req.chatChannel,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async continueChatting(req, res, next) {
    try {
      const receiveIssue = await ChatService.continueChatting({
        user: req.user,
        chatChannel: req.chatChannel,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async addMoreInformation(req, res, next) {
    try {
      const receiveIssue = await ChatService.addInformation({
        user: req.user,
        chatChannel: req.chatChannel,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async postWebhook(req, res, next) {
    try {
      const { body: data } = req;
      const channelSid = get(data, 'ChannelSid', get(data, 'ConversationSid', ''));
      const clientIdentity = get(data, 'ClientIdentity');
      const message = get(data, 'Body');
      await ChatService.handleWebhook({ channelSid, clientIdentity, message });

      return res.status(200).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async addPromotion(req, res, next) {
    try {
      const { user, chatChannel } = req;
      const attachmentIds = get(req, 'body.attachmentIds', []);

      await ChatService.addPromotion({ user, chatChannel, attachmentIds });

      return res.status(200).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async acceptPayment(req, res, next) {
    try {
      const receiveIssue = await ChatService.acceptPayment({
        user: req.user,
        chatChannel: req.chatChannel,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async finish(req, res, next) {
    try {
      const receiveIssue = await ChatService.finish({
        user: req.user,
        chatChannel: req.chatChannel,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async joinChatHistory(req, res, next) {
    try {
      const { user } = req;
      const issueId = get(req, 'body.issueId');
      const author = await ChatService.joinChatHistory(user, issueId);

      return res.status(200).send(objectToSnake(author.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async survey(req, res, next) {
    try {
      const { user, chatChannel, body: data } = req;
      await ChatService.survey({ user, chatChannel, data });

      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  }

  static async approveSurvey(req, res, next) {
    try {
      const { user, chatChannel, body: data } = req;
      await ChatService.approveSurvey({ user, chatChannel, data });

      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  }
}
