import { issueStatus } from 'constants';
import { paymentStatus } from 'constants/app';
import Issue from '../../../models/issue';
import ReceiveIssue from '../../../models/receiveIssue';
import Payment from '../../../models/payment';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByPk(req.params.issueId, {
      include: [
        {
          model: Payment,
          required: true,
        },
        {
          model: ReceiveIssue,
          required: true,
          as: 'supporting',
          where: {
            status: issueStatus.DONE,
          },
        },
      ],
      logging: true,
    });

    if (!issue || issue.createdBy !== req.user.id) {
      throw errorFactory.getError('ISSU-0001');
    }

    if (issue.payment.status === paymentStatus.PAID) {
      throw errorFactory.getError('PAY-0003');
    }
    req.issue = issue;
    return next();
  } catch (e) {
    return next(e);
  }
};
