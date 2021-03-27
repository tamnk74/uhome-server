import omit from 'lodash/omit';
import Pagination from '../../../helpers/Pagination';
import UserService from '../services/user';
import { objectToSnake, toPlain, distance } from '../../../helpers/Util';

export default class UserController {
  static async getIssues(req, res, next) {
    try {
      const pagination = new Pagination(req.query);
      const issues = await UserService.getIssues({
        ...req.query,
        limit: pagination.limit,
        offset: pagination.skip,
        user: req.user,
      });
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: issues.rows.map((issue) => objectToSnake(issue.toJSON())),
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getReceiveIssues(req, res, next) {
    try {
      const pagination = new Pagination(req.query);
      const issues = await UserService.getReceiveIssues({
        ...req.query,
        limit: pagination.limit,
        offset: pagination.skip,
        userId: req.params.id,
      });
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: issues.rows.map((issue) => objectToSnake(issue.toJSON())),
      });
    } catch (e) {
      return next(e);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      await UserService.updateProfile(req.user.id, req.body);

      return res.status(204).json();
    } catch (e) {
      return next(e);
    }
  }

  static async uploadFile(req, res, next) {
    try {
      const url = await UserService.uploadFile(req.user.id, req);

      return res.status(200).json({ url });
    } catch (e) {
      return next(e);
    }
  }

  static async getUserProfile(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.userId);
      const userData = omit(toPlain(user), [
        'verify_code',
        'password',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ]);
      userData.distance = distance(0.0001, 0.0001, 0.0002, 0.0002);
      userData.profile.identityCard = userData.profile.identityCard
        ? JSON.parse(userData.profile.identityCard)
        : { before: null, after: null };

      return res.status(200).json(objectToSnake(userData));
    } catch (e) {
      return next(e);
    }
  }

  static async subscribe(req, res, next) {
    try {
      await UserService.subscribe({
        userId: req.user.id,
        token: req.body.deviceToken,
      });
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async skills(req, res, next) {
    try {
      await UserService.createOrUpdateSkills(req.user.id, req.body);

      return res.status(204).json();
    } catch (e) {
      return next(e);
    }
  }

  static async unsubscribe(req, res, next) {
    try {
      await UserService.unsubscribe({
        userId: req.user.id,
        token: req.body.deviceToken,
      });
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }
}
