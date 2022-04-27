import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';
import { roles } from '../../../constants';

export const verifyOwnerIssue = async (req, res, next) => {
  try {
    const { user } = req;
    const where = {
      id: req.params.issueId,
    };

    if (![roles.CONSULTING, roles.ADMIN].includes(user.role)) {
      where.createdBy = req.user.id;
    }

    const issue = await Issue.findOne({
      where,
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
