import IssueService from '../services/issue';
import { objectToCamel, objectToSnake } from '../../../helpers/Util';
import Pagination from '../../../helpers/Pagination';

export default class AuthController {
  static async create(req, res, next) {
    try {
      const issue = await IssueService.create({
        ...req.body,
        createdBy: req.user.id,
      });
      return res.status(201).json(objectToSnake(issue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async remove(req, res, next) {
    try {
      await IssueService.remove(req.issue);
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async show(req, res, next) {
    try {
      const issue = await IssueService.getDetail(req.issue.id);
      return res.status(201).json(objectToSnake(issue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async index(req, res, next) {
    try {
      const pagination = new Pagination(req.query);
      const issues = await IssueService.getIssues({
        ...objectToCamel(req.query),
        user: req.user,
        limit: pagination.limit,
        offset: pagination.skip,
      });
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: issues.rows.map((issue) => {
          const item = issue.toJSON();
          item.isRequested = false;

          for (let i = 0; i < item.requestUsers.length; i++) {
            if (req.user.id === item.requestUsers[i].id) {
              item.isRequested = true;
            }
          }

          return objectToSnake(item);
        }),
      });
    } catch (e) {
      return next(e);
    }
  }
}
