import Pagination from '../../../helpers/Pagination';
import UserService from '../services/user';
import { objectToSnake } from '../../../helpers/Util';

export default class UserController {
  static async getIssues(req, res, next) {
    try {
      const pagination = new Pagination(req.query);
      const issues = await UserService.getIssues({
        ...req.query,
        limit: pagination.limit,
        offset: pagination.skip,
        user: req.user,
      });
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: issues.rows.map((issue) => objectToSnake(issue.toJSON())),
      });
    } catch (e) {
      return next(e);
    }
  }
}
