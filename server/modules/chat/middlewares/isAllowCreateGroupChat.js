import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';

export const isAllowCreateGroupChat = async (req, res, next) => {
  try {
    const { issueId, userId } = req.body;
    const { user } = req;
    const issue = await Issue.findByPk(issueId);

    if (!issue) {
      return next(errorFactory.getError('ISSU-0001'));
    }

    if (user.id === userId) {
      return next(errorFactory.getError('CHAT-0203'));
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
