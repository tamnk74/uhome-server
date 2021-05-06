import omit from 'lodash/omit';
import { ExtractJwt } from 'passport-jwt';
import AuthService from '../services/auth';
import { objectToSnake } from '../../../helpers/Util';

export default class AuthController {
  static async login(req, res, next) {
    try {
      const authUser = await AuthService.authenticate(req.body);

      return res.status(200).json(objectToSnake(authUser));
    } catch (e) {
      return next(e);
    }
  }

  static async loginFb(req, res, next) {
    try {
      const authUser = await AuthService.handleFacebookAuth(req.body.accessToken);

      const authData = omit(authUser, [
        'password',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'status',
      ]);
      return res.status(200).json(objectToSnake(authData));
    } catch (e) {
      return next(e);
    }
  }

  static async loginZalo(req, res, next) {
    try {
      const authUser = await AuthService.handleZaloAuth(req.body.code);

      return res.status(200).json(objectToSnake(authUser));
    } catch (e) {
      return next(e);
    }
  }

  static async refrehToken(req, res, next) {
    try {
      const authUser = await AuthService.refrehToken(req.body.refresh_token);

      return res.status(200).json(objectToSnake(authUser));
    } catch (e) {
      return next(e);
    }
  }

  static async logout(req, res, next) {
    try {
      const token = req.headers.authorization.slice(7);
      await AuthService.logout(req.user, token);

      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async userInfo(req, res, next) {
    try {
      const user = await AuthService.getUserById(req.user.id);
      const userData = omit(user.toJSON(), [
        'verify_code',
        'password',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ]);
      return res.status(200).json(objectToSnake(userData));
    } catch (e) {
      return next(e);
    }
  }

  static async updateUser(req, res, next) {
    try {
      await AuthService.updateUser(req.user.id, req.body);
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async register(req, res, next) {
    try {
      const authUser = await AuthService.register(req.body);

      return res.status(200).json(objectToSnake(authUser.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async authorize(req, res, next) {
    try {
      const auth = await AuthService.authorize(req.body);

      return res.status(200).json(objectToSnake(auth));
    } catch (e) {
      return next(e);
    }
  }

  static async verifyCode(req, res, next) {
    try {
      const authUser = await AuthService.verifyCode(req.params.userId, req.body.verifyCode);

      return res.status(200).json(authUser);
    } catch (e) {
      return next(e);
    }
  }
}
