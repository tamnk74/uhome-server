import passport from 'passport';
import { ExtractJwt } from 'passport-jwt';
import errorFactory from '../errors/ErrorFactory';
import { acl } from '../constants';
import RedisService from '../helpers/Redis';

export default (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, jwtPayload) => {
    const user = jwtPayload;
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!user) {
      await RedisService.removeAccessToken(user.id, token);

      return next(errorFactory.getError('ERR-0401'));
    }

    const sessionRole = await RedisService.getRoleAccessToken(user.id, token);

    if (!sessionRole) {
      await RedisService.removeAccessToken(user.id, token);

      return next(errorFactory.getError('ERR-0401'));
    }

    const permissions = acl[req.route.path] && acl[req.route.path][req.method];

    if (permissions && !permissions.includes(sessionRole)) {
      return next(errorFactory.getError('ERR-0403'));
    }

    user.sessionRole = sessionRole;
    req.user = user;

    next();
  })(req, res);
};
