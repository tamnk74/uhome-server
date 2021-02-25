import AuthService from '../services/auth';
import { userSerializer, authSerializer } from '../serializer';

export default class AuthController {
  static async login(req, res, next) {
    try {
      const authUser = await AuthService.authenticate(req.body);

      return res.status(200).json(authSerializer.serialize(authUser));
    } catch (e) {
      return next(e);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const authUser = await AuthService.handleGoogleAuth(req.body.access_token);

      return res.status(200).json(authSerializer.serialize(authUser));
    } catch (e) {
      return next(e);
    }
  }

  static async refrehToken(req, res, next) {
    try {
      const authUser = await AuthService.refrehToken(req.body.refresh_token);

      return res.status(200).json(authSerializer.serialize(authUser));
    } catch (e) {
      return next(e);
    }
  }

  static async userInfo(req, res, next) {
    try {
      const user = await AuthService.getUserById(req.user.id);

      return res.status(200).json(userSerializer.serialize(user));
    } catch (e) {
      return next(e);
    }
  }
}
