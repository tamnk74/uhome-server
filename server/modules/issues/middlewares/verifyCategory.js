import { get, isEmpty } from 'lodash';
import errorFactory from '../../../errors/ErrorFactory';
import User from '../../../models/user';
import Category from '../../../models/category';
import CategoryIssue from '../../../models/categoryIssue';

export const verifyCategory = async (req, res, next) => {
  try {
    const { issue, user } = req;
    if (!issue) {
      return next(errorFactory.getError('ISSU-0001'));
    }
    const [userCategory, categoryIssues] = await Promise.all([
      User.findByPk(user.id, {
        include: [
          {
            model: Category,
            as: 'categories',
          },
        ],
      }),
      CategoryIssue.findAll({
        where: {
          issueId: issue.id,
        },
      }),
    ]);

    const categories = get(userCategory, 'categories', []);
    const categoriesOfUser = categories.map((item) => item.id);
    const categoriesOFIssue = categoryIssues.map((item) => item.categoryId);

    const intersection = categoriesOfUser.filter((x) => categoriesOFIssue.includes(x));

    if (isEmpty(intersection)) {
      return next(errorFactory.getError('CHAT-0203'));
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
