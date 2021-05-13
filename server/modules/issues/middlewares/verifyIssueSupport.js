import Issue from '../../../models/issue';
import ReceiveIssue from '../../../models/receiveIssue';
import errorFactory from '../../../errors/ErrorFactory';
import { issueStatus, userRoles } from '../../../constants';

export const verifyIssueSupport = async (req, res, next) => {
  try {
    const receiveIssue = await ReceiveIssue.findOne({
      where: {
        status: issueStatus.IN_PROGRESS,
      },
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
      throw errorFactory.getError('ISSU-0001');
    }
    const { user } = req;
    if (user.role === userRoles.CUSTOMER && receiveIssue.issue.createdBy !== user.id) {
      throw errorFactory.getError('ISSU-0001');
    }

    if (user.role === userRoles.WORKER && receiveIssue.userId !== user.id) {
      throw errorFactory.getError('ISSU-0001');
    }

    req.receiveIssue = receiveIssue;
    return next();
  } catch (e) {
    return next(e);
  }
};
