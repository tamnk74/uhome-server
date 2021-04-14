import Issue from '../../../models/issue';
import User from '../../../models/user';
import { notificationQueue } from '../../../helpers/Queue';
import RequestSupporting from '../../../models/requestSupporting';
import { issueStatus } from '../../../constants';

export default class IssueService {
  static async create(issue) {
    issue = await Issue.addIssue(issue);
    notificationQueue.add('issue', { id: issue.id });
    return this.getDetail(issue.id);
  }

  static async remove(issue) {
    return Issue.removeIssue(issue);
  }

  static async getDetail(id) {
    return Issue.findByPk(id, {
      include: [...Issue.buildRelation()],
    });
  }

  static async getIssues(query) {
    const { limit, offset, categoryIds, status } = query;
    const filter = query.filter || {};
    if (status) {
      filter.status = status;
    }
    query.filter = filter;

    const options = Issue.buildOptionQuery(query);

    return Issue.findAndCountAll({
      ...options,
      include: [
        ...Issue.buildRelation(categoryIds),
        {
          model: User,
          as: 'requestUsers',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'longitude', 'latitude'],
        },
      ],
      limit,
      offset,
    });
  }

  static async requestSupporting(user, issue) {
    if (issue.status !== issueStatus.OPEN) {
      throw new Error('ISSUE-0002');
    }

    const requestSupporting = await RequestSupporting.findOrCreate({
      where: {
        userId: user.id,
        issueId: issue.id,
      },
    });
    notificationQueue.add('request_supporting', { id: requestSupporting.id });
    return requestSupporting;
  }
}
