import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';
import { issueStatus } from '../../../constants';

export const validIssueSupport = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({
      where: {
        id: req.params.issueId,
        status: issueStatus.OPEN,
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
