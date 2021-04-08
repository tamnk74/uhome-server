import Issue from '../../../models/issue';
import User from '../../../models/user';

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
      ],
      limit,
      offset,
    });
  }
}
