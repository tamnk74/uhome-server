import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({
      where: {
        id: req.params.issueId,
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
