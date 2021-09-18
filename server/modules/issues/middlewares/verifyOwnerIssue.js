import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyOwnerIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({
      where: {
        id: req.params.issueId,
        createdBy: req.user.id,
      },
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
