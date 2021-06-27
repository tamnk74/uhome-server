import ReceiveIssue from '../../../models/receiveIssue';
import Issue from '../../../models/issue';
import Payment from '../../../models/payment';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyReceiveIssue = async (req, res, next) => {
  try {
    const receiveIssue = await ReceiveIssue.findByPk(req.params.receiveIssueId, {
      include: [
        {
          model: Issue,
          required: true,
        },
        {
          model: Payment,
          required: true,
        },
      ],
    });

    if (!receiveIssue) {
      throw errorFactory.getError('ISSU-0001');
    }

    req.receiveIssue = receiveIssue;
    return next();
  } catch (e) {
    return next(e);
  }
};
