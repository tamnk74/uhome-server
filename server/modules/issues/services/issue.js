import Issue from '../../../models/issue';

export default class IssueService {
  static async create(issue) {
    return Issue.addIssue(issue);
  }

  static async remove(issue) {
    return Issue.removeIssue(issue);
  }

  static async getDetail(id) {
    return Issue.findByPk(id);
  }
}
