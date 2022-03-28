import { issueStatus } from '@/constants';
import Issue from '@/models/issue';
import Acceptance from '@/models/acceptance';
import ReceiveIssue from '@/models/receiveIssue';
import errorFactory from '@/errors/ErrorFactory';

export const verifyCheckoutIssue = async (req, res, next) => {
  try {
    const receiveIssue = await ReceiveIssue.findOne({
      where: {
        issueId: req.params.issueId,
        status: [issueStatus.IN_PROGRESS, issueStatus.WAITING_PAYMENT],
      },
      include: [
        {
          model: Issue,
          required: true,
          where: {
            createdBy: req.user.id,
          },
        },
        {
          model: Acceptance,
          as: 'acceptances',
          required: true,
        },
      ],
    });
    if (!receiveIssue) {
      return next(errorFactory.getError('ISSUE-0403'));
    }
    const {
      issue,
      acceptances: [acceptance],
    } = receiveIssue;

    if (!issue) {
      return next(errorFactory.getError('ISSU-0001'));
    }

    if (!acceptance || !acceptance.data || !acceptance.data.totalAmount) {
      return next(errorFactory.getError('ISSUE-0403'));
    }

    // if (acceptance.data.totalAmount > req.body.amount) {
    //   return next(errorFactory.getError('ISSU-0001'));
    // }

    req.issue = issue;
    req.receiveIssue = receiveIssue;
    req.acceptance = acceptance;
    return next();
  } catch (e) {
    return next(e);
  }
};
