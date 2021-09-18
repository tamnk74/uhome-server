import Issue from '../../../models/issue';
import ReceiveIssue from '../../../models/receiveIssue';
import errorFactory from '../../../errors/ErrorFactory';
import { userRoles } from '../../../constants';

export const verifyIssueSupport = async (req, res, next) => {
  try {
    const receiveIssue = await ReceiveIssue.findOne({
      include: [
        {
          model: Issue,
          required: true,
          where: {
            id: req.params.issueId,
          },
        },
      ],
    });

    if (!receiveIssue) {
      return next(errorFactory.getError('ISSU-0001'));
    }
    const { user } = req;
    if (user.sessionRole === userRoles.CUSTOMER && receiveIssue.issue.createdBy !== user.id) {
      return next(errorFactory.getError('ISSU-0001'));
    }

    if (user.sessionRole === userRoles.WORKER && receiveIssue.userId !== user.id) {
      return next(errorFactory.getError('ISSU-0001'));
    }

    req.receiveIssue = receiveIssue;
    return next();
  } catch (e) {
    return next(e);
  }
};
