import Category from '../../../models/category';

export default class CategoryService {
  static async list(query) {
    const { limit, offset } = query;
    const options = Category.buildOptionQuery(query);
    return Category.findAndCountAll({
      ...options,
      attributes: Category.baseAttributes,
      limit,
      offset,
    });
  }
}
