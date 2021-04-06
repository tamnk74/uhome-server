import Issue from '../../../models/issue';
import Attachment from '../../../models/attachment';
import Category from '../../../models/category';

export default class IssueService {
  static async create(issue) {
    issue = await Issue.addIssue(issue);
    return this.getDetail(issue.id);
  }

  static async remove(issue) {
    return Issue.removeIssue(issue);
  }

  static async getDetail(id) {
    return Issue.findByPk(id, {
      include: [
        {
          model: Category,
          required: false,
          as: 'categories',
        },
        {
          model: Attachment,
          as: 'attachments',
          require: false,
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
    });
  }
}
