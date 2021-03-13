import Issue from '../../../models/issue';
import Category from '../../../models/category';
import Attachment from '../../../models/attachment';

export default class Userervice {
  static async getIssues(query) {
    const { limit, offset, user } = query;
    const options = Issue.buildOptionQuery(query);
    options.where.createdBy = user.id;
    return Issue.findAndCountAll({
      ...options,
      include: [
        {
          model: Category,
          required: false,
          as: 'categories',
        },
        {
          model: Attachment,
          required: false,
          as: 'attachments',
          attributes: [
            'id',
            'size',
            'mimeType',
            'createdAt',
            'updatedAt',
            'issueId',
            'path',
            Attachment.buildUrlAttribuiteSelect(),
          ],
        },
      ],
      attributes: Issue.baseAttibutes,
      limit,
      offset,
    });
  }
}
