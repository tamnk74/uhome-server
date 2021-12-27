import errorFactory from '../errors/ErrorFactory';
import Issue from '../models/issue';
import ReceiveIssue from '../models/receiveIssue';
import { issueStatus } from '../constants';

export default async (req, res, next) => {
  const { user } = req;

  const [issue, receiveIssue] = await Promise.all([
    Issue.findOne({
      where: {
        createdBy: user.id,
        status: [
          issueStatus.CHATTING,
          issueStatus.IN_PROGRESS,
          issueStatus.WAITING_VERIFY,
          issueStatus.WAITING_PAYMENT,
        ],
      },
    }),
    ReceiveIssue.findOne({
      where: {
        userId: user.id,
        status: [
          issueStatus.CHATTING,
          issueStatus.IN_PROGRESS,
          issueStatus.WAITING_VERIFY,
          issueStatus.WAITING_PAYMENT,
        ],
      },
    }),
  ]);

  if (issue || receiveIssue) {
    return next(errorFactory.getError('ISSUE-0414'));
  }

  return next();
};
