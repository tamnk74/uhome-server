import RequestSupporting from '../../../models/requestSupporting';
import errorFactory from '../../../errors/ErrorFactory';
import { roles } from '../../../constants';

export const isAllowCreateGroupChat = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { user, issue } = req;

    if (user.id === userId) {
      return next(errorFactory.getError('CHAT-0203'));
    }

    if (user.role !== roles.USER) {
      return next();
    }

    const requestSupporting = await RequestSupporting.findOne({
      where: {
        issueId: issue.id,
        userId: [user.id, userId],
      },
    });

    if (!requestSupporting) {
      return next(errorFactory.getError('CHAT-0203'));
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
