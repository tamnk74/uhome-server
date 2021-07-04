import passport from 'passport';
import errorFactory from '../errors/ErrorFactory';
import { acl, status } from '../constants';
import User from '../models/user';

export default (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, jwtPayload) => {
    let user = jwtPayload;

    if (!user) {
      return next(errorFactory.getError('ERR-0401'));
    }

    user = await User.findByPk(user.id);
    const { sessionRole } = user;

    if (!sessionRole) {
      return next(errorFactory.getError('ERR-0410'));
    }

    const permissions = acl[req.route.path] && acl[req.route.path][req.method];

    if (permissions && !permissions.includes(sessionRole)) {
      return next(errorFactory.getError('ERR-0403'));
    }

    if (user.status === status.IN_ACTIVE) {
      return next(errorFactory.getError('USER-0001'));
    }

    req.user = user;
    next();
  })(req, res);
};
