import Issue from '../../../models/issue';

export default class IssueService {
  static async create(issue) {
    return Issue.addIssue(issue);
  }

  static async remove(issueId) {
    return Issue.destroy({
      where: {
        id: issueId,
      },
    });
  }
}
