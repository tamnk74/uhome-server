import User from '../../../models/user';

export const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new Error('User not found'));
    }

    req.verifyUser = user;
    return next();
  } catch (e) {
    return next(e);
  }
};
