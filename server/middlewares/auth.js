import passport from 'passport';
import errorFactory from '../errors/ErrorFactory';
import RedisService from '../helpers/Redis';

export default (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, jwtPayload) => {
    const user = jwtPayload;
    if (!user) {
      return next(errorFactory.getError('ERR-0401'));
    }

    const token = req.headers.authorization.slice(7);
    const isExistToken = await RedisService.isExistAccessToken(user.id, token);
    if (!isExistToken) {
      return next(errorFactory.getError('ERR-0401'));
    }

    req.user = user;
    next();
  })(req, res);
};
