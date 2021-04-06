import Issue from '../../../models/issue';
import Category from '../../../models/category';
import Attachment from '../../../models/attachment';
import ReceiveIssue from '../../../models/receiveIssue';
import ReceiveIssueComment from '../../../models/receiveIssueComment';
import User from '../../../models/user';

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

  static async getReceiveIssues(query) {
    const { limit, offset, userId } = query;
    const options = ReceiveIssue.buildOptionQuery(query);
    options.where.userId = userId;
    return ReceiveIssue.findAndCountAll({
      ...options,
      include: [
        {
          model: Issue,
          required: true,
          include: [
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
        },
        {
          model: ReceiveIssueComment,
          required: false,
          include: [
            {
              model: User,
              required: true,
              attributes: ['id', 'name', 'avatar'],
            },
          ],
        },
      ],
      limit,
      offset,
    });
  }
}
