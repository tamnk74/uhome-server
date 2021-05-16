import { Sequelize } from 'sequelize';
import Issue from '../../../models/issue';
import User from '../../../models/user';
import { notificationQueue } from '../../../helpers/Queue';
import RequestSupporting from '../../../models/requestSupporting';
import { issueStatus } from '../../../constants';
import UserProfile from '../../../models/userProfile';
import ReceiveIsssue from '../../../models/receiveIssue';
import Rating from '../../../models/rating';
import sequelize from '../../../databases/database';

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
    const optionsCount = {
      attributes: [[Sequelize.fn('COUNT', Sequelize.col('issue_id')), 'totalRequestSupporting']],
      where: {
        issue_id: {
          [Sequelize.Op.eq]: sequelize.col('issues.id'),
        },
      },
    };
    const countSQL = sequelize.dialect.QueryGenerator.selectQuery(
      'request_supportings',
      optionsCount,
      RequestSupporting
    ).slice(0, -1);
    const optionsIsrequested = {
      attributes: [[Sequelize.fn('COUNT', Sequelize.col('issue_id')), 'isRequested']],
      where: {
        issue_id: {
          [Sequelize.Op.eq]: sequelize.col('issues.id'),
        },
        user_id: {
          [Sequelize.Op.eq]: user.id,
        },
      },
    };
    const isRequestedSQL = sequelize.dialect.QueryGenerator.selectQuery(
      'request_supportings',
      optionsIsrequested,
      RequestSupporting
    ).slice(0, -1);

    return Issue.findAndCountAll({
      ...options,
      include: [
        ...Issue.buildRelation(categoryIds),
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'longitude', 'latitude'],
        },
      ],
      attributes: {
        include: [
          [Sequelize.literal(`(${countSQL})`), 'totalRequestSupporting'],
          [Sequelize.literal(`(${isRequestedSQL})`), 'isRequested'],
        ],
      },
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
      nest: true,
      raw: true,
      limit,
      offset,
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

  static async cancelSupporting({ user, receiveIssue, data }) {
    const cancelSupporting = await ReceiveIsssue.cancel({
      data,
      receiveIssue,
      userId: user.id,
    });

    // notificationQueue.add('cancel_supporting', {
    //   receiveIssue,
    //   actorId: user.id,
    //   userId: receiveIssue.userId !== user.id ? receiveIssue.userId : receiveIssue.issue.createdBy,
    // });

    return cancelSupporting;
  }

  static async setRating({ receiveIssue, data }) {
    const [rating] = await Promise.all([
      Rating.create({
        ...data,
        userId: receiveIssue.userId,
      }),
      // Update issue status
    ]);

    // Todo: Send notification

    return rating;
  }
}
