import Issue from '../../../models/issue';
import User from '../../../models/user';
import errorFactory from '../../../errors/ErrorFactory';

export const validIssue = async (req, res, next) => {
  try {
    const { issueId } = req.body;
    const issue = await Issue.findByPk(issueId, {
      include: [
        {
          model: User,
          require: true,
          as: 'creator',
        },
      ],
    });

    if (!issue) {
      return next(errorFactory.getError('ISSU-0001'));
    }

    req.issue = issue;

    return next();
  } catch (e) {
    return next(e);
  }
};
