import passport from 'passport';
import errorFactory from '../errors/ErrorFactory';

export default (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, jwtPayload) => {
    const user = jwtPayload;
    console.log(jwtPayload);
    if (!user) {
      return next(errorFactory.getError('ERR-0401'));
    }
    // if (user.status === User.INACTIVE) {
    //   return next(errorFactory.getError('USER-0001'));
    // }

    req.user = user;
    next();
  })(req, res);
};
