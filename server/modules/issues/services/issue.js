import Sequelize from 'sequelize';
import Issue from '../../../models/issue';
import User from '../../../models/user';
import { notificationQueue } from '../../../helpers/Queue';
import RequestSupporting from '../../../models/requestSupporting';
import { issueStatus } from '../../../constants';
import UserProfile from '../../../models/userProfile';

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
    const { limit, offset, categoryIds, status, user } = query;
    const filter = query.filter || {};
    if (status) {
      filter.status = status;
    }
    query.filter = filter;

    const options = Issue.buildOptionQuery(query);

    return Issue.findAndCountAll({
      ...options,
      include: [
        ...Issue.buildRelation(categoryIds, false),
        {
          model: RequestSupporting,
          as: 'requestSupportings',
          attributes: [],
          duplicating: false,
          include: [
            {
              model: User,
              duplicating: false,
              required: false,
              where: {
                id: user.id,
              },
            },
          ],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'longitude', 'latitude'],
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('requestSupportings.id')), 'totalRequestSupporting'],
          [Sequelize.literal('IF(`requestSupportings->user`.id is NULL, 0, 1)'), 'isRequested'],
        ],
      },
      group: ['issues.id'],
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

  static async getRequestSupporting(query) {
    const { limit, offset, id } = query;
    return User.findAndCountAll({
      include: [
        {
          model: RequestSupporting,
          as: 'requestSupportings',
          required: true,
          where: {
            issueId: id,
          },
        },
        {
          model: UserProfile,
          as: 'profile',
          required: true,
          attributes: ['id', 'userId', 'reliability'],
        },
      ],
      limit,
      offset,
      nest: true,
      raw: true,
    });
  }

  static async cacelRequestSupporting(user, issue) {
    return RequestSupporting.destroy({
      where: {
        userId: user.id,
        issueId: issue.id,
      },
    });
  }

  static async cancelSupporting(user, issue) {
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
