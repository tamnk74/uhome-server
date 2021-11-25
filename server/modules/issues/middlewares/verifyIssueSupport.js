import { Op } from 'sequelize';
import Issue from '../../../models/issue';
import ReceiveIssue from '../../../models/receiveIssue';
import errorFactory from '../../../errors/ErrorFactory';
import { issueStatus } from '../../../constants';

export const verifyIssueSupport = async (req, res, next) => {
  try {
    const { user } = req;

    const receiveIssue = await ReceiveIssue.findOne({
      where: {
        [Op.or]: [
          {
            status: {
              [Op.in]: [issueStatus.CHATTING, issueStatus.IN_PROGRESS, issueStatus.OPEN],
            },
          },
          { userId: user.id },
        ],
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
      return next(errorFactory.getError('ISSU-0001'));
    }

    if (receiveIssue.issue.createdBy !== user.id && receiveIssue.userId !== user.id) {
      return next(errorFactory.getError('ISSU-0001'));
    }

    req.receiveIssue = receiveIssue;
    return next();
  } catch (e) {
    return next(e);
  }
};
