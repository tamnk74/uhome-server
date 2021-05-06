import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';
import { issueStatus } from '../../../constants';

export const verifyIssueSupport = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({
      where: {
        id: req.params.issueId,
        status: issueStatus.IN_PROGRESS,
      },
    });

    if (!issue) {
      throw errorFactory.getError('ISSU-0001');
    }

    req.issue = issue;
    return next();
  } catch (e) {
    return next(e);
  }
};
