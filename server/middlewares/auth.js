import passport from 'passport';
import { ExtractJwt } from 'passport-jwt';
import _ from 'lodash';
import errorFactory from '../errors/ErrorFactory';
import RedisService from '../helpers/Redis';
import { roleRights } from '../config';
import { roles } from '../constants';
import User from '../models/user';

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(errorFactory.getError('ERR-0401'));
  }
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

  if (!user) {
    await RedisService.removeAccessToken(user.id, token);
    return reject(errorFactory.getError('ERR-0401'));
  }

  const signedSocial = _.get(user, 'signedSocial', false);

  const [storedUser, sessionRole] = await Promise.all([
    User.findByPk(user.id),
    RedisService.getRoleAccessToken(user.id, token),
  ]);

  if (_.isEmpty(storedUser)) {
    return reject(errorFactory.getError('ERR-0401'));
  }

  if (_.get(storedUser, 'role') === roles.USER && !sessionRole) {
    await RedisService.removeAccessToken(user.id, token);
    return reject(errorFactory.getError('ERR-0401'));
  }

  if (requiredRights.length) {
    const userRights = roleRights.get(storedUser.role) || [];
    const sessionRight = roleRights.get(sessionRole) || [];

    const rolesPermision = userRights.concat(sessionRight);
    const hasRequiredRights = requiredRights.every((requiredRight) =>
      rolesPermision.includes(requiredRight)
    );
    if (!hasRequiredRights) {
      return reject(errorFactory.getError('ERR-0403'));
    }
  }

  user.sessionRole = sessionRole;
  user.role = storedUser.role;
  user.signedSocial = signedSocial;
  user.lat = storedUser.lat;
  user.lon = storedUser.lon;
  req.user = user;
  resolve();
};

export default (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',
      { session: false },
      verifyCallback(req, resolve, reject, requiredRights)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};
