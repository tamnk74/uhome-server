import { Op } from 'sequelize';
import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';
import { issueStatus } from '../../../constants';
import Category from '../../../models/category';

export const validIssueSupport = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({
      where: {
        id: req.params.issueId,
        status: {
          [Op.in]: [issueStatus.IN_PROGRESS, issueStatus.CHATTING, issueStatus.WAITING_VERIFY],
        },
      },
      include: [
        {
          model: Category,
          as: 'categories',
        },
      ],
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
