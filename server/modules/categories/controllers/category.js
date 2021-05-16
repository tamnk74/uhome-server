import CategoryService from '../services/category';
import { objectToSnake } from '../../../helpers/Util';
import Pagination from '../../../helpers/Pagination';

export default class AuthController {
  static async list(req, res, next) {
    try {
      const pagination = new Pagination(req);
      const categories = await CategoryService.list({
        ...req.query,
        limit: pagination.limit,
        offset: pagination.skip,
      });
      pagination.setTotal(categories.count);
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: categories.rows.map((category) => objectToSnake(category.toJSON())),
      });
    } catch (e) {
      return next(e);
    }
  }
}
