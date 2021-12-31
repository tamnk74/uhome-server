import TransactionHistory from '../../../models/transactionHistory';
import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyTransactionHistory = async (req, res, next) => {
  try {
    const transactionHistory = await TransactionHistory.findByPk(req.params.id, {
      include: [
        {
          model: Issue,
          require: true,
        },
      ],
    });

    if (!transactionHistory) {
      return next(errorFactory.getError('CHAT-0404'));
    }

    req.transactionHistory = transactionHistory;
    return next();
  } catch (e) {
    return next(e);
  }
};
