import { omit, get } from 'lodash';
import { ExtractJwt } from 'passport-jwt';
import Pagination from '../../../helpers/Pagination';
import UserService from '../services/user';
import { objectToSnake, distance } from '../../../helpers/Util';

export default class UserController {
  static async getIssues(req, res, next) {
    try {
      const pagination = new Pagination(req);
      const issues = await UserService.getIssues({
        ...req.query,
        limit: pagination.limit,
        offset: pagination.skip,
        user: req.user,
      });
      pagination.setTotal(issues.count);
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
      const pagination = new Pagination(req);
      const issues = await UserService.getReceiveIssues({
        ...req.query,
        limit: pagination.limit,
        offset: pagination.skip,
        userId: req.params.id,
      });
      pagination.setTotal(issues.count);
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: issues.rows.map((issue) => objectToSnake(issue.toJSON())),
      });
    } catch (e) {
      console.log(e);
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
      const userData = omit(user.toJSON(), [
        'verify_code',
        'password',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ]);
      userData.distance = distance(0.0001, 0.0001, 0.0002, 0.0002);
      if (!userData.profile) {
        userData.profile = user.profile.toJSON();
        userData.profile.identityCard = JSON.parse(userData.profile.identityCard);
      }

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
        deviceId: req.body.deviceId,
        role: get(req, 'user.sessionRole') ? get(req, 'user.role') : null,
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
        token: req.body.deviceToken,
        deviceId: req.body.deviceId,
      });
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async storeLatestLocation(req, res, next) {
    try {
      await UserService.updateLatestLocation({
        userId: req.user.id,
        data: req.body,
      });
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async updatePassword(req, res, next) {
    try {
      await UserService.updatePassword({
        userId: req.user.id,
        data: req.body,
      });
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async changeSessionRole(req, res, next) {
    try {
      const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      const signedSocial = get(req, 'user.signedSocial', false);

      const user = await UserService.changeSesionRole({
        user: req.user,
        role: req.body.role,
        accessToken,
      });

      user.setDataValue('signedSocial', signedSocial);

      return res.status(200).json(objectToSnake(user));
    } catch (e) {
      return next(e);
    }
  }

  static async getTransactionHistories(req, res, next) {
    try {
      const pagination = new Pagination(req);
      const histories = await UserService.getTransactionHistories({
        user: req.user,
        query: {
          ...req.query,
          limit: pagination.limit,
          offset: pagination.skip,
        },
      });

      pagination.setTotal(histories.count);
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: histories.rows.map((history) => objectToSnake(history)),
      });
    } catch (e) {
      return next(e);
    }
  }

  static async sendOTP(req, res, next) {
    try {
      const { id } = req.params;

      await UserService.reSendOTP(id);

      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async getLatestIssueStatus(req, res, next) {
    try {
      const { user } = req;
      const latestStatus = await UserService.getLatestIssueStatus(user);
      return res.status(200).json(objectToSnake(latestStatus || {}));
    } catch (e) {
      return next(e);
    }
  }
}
