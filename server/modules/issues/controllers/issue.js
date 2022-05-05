import { omit, get } from 'lodash';
import IssueService from '../services/issue';
import { objectToCamel, objectToSnake } from '../../../helpers/Util';
import Pagination from '../../../helpers/Pagination';

export default class AuthController {
  static async getUploadVideoLink(req, res, next) {
    try {
      const result = await IssueService.getUploadVideoLink({
        user: req.user,
        thumbnail: req.thumbnail,
      });

      return res.status(200).json(objectToSnake(result));
    } catch (e) {
      return next(e);
    }
  }

  static async create(req, res, next) {
    try {
      const issue = await IssueService.create(req.user, {
        ...req.body,
        createdBy: req.user.id,
        saleEvent: req.saleEvent,
      });
      return res.status(201).json(objectToSnake(issue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async remove(req, res, next) {
    try {
      await IssueService.remove(req.issue);
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async show(req, res, next) {
    try {
      const issue = await IssueService.getDetail(req.user, req.issue.id);
      return res.status(201).json(objectToSnake(issue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async index(req, res, next) {
    try {
      const pagination = new Pagination(req);
      const { total, data } = await IssueService.getIssues({
        ...objectToCamel(req.query),
        user: req.user,
        limit: pagination.limit,
        offset: pagination.skip,
      });
      pagination.setTotal(total);
      return res.status(200).json({
        meta: pagination.getMeta(),
        data,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async requestSupporting(req, res, next) {
    try {
      const payload = get(req, 'body', {});

      await IssueService.requestSupporting(req.user, req.issue, payload);
      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async getRequestSupporting(req, res, next) {
    try {
      const pagination = new Pagination(req);
      const requestSupports = await IssueService.getRequestSupporting({
        ...objectToCamel(req.query),
        id: req.issue.id,
        limit: pagination.limit,
        offset: pagination.skip,
      });
      pagination.setTotal(requestSupports.count);
      return res.status(200).json({
        meta: pagination.getMeta(),
        data: requestSupports.rows.map((item) => {
          const requestSupporting = get(item, 'requestSupportings.[0]');
          item.setDataValue('distance', get(requestSupporting, 'distance', 0));
          item.setDataValue('distanceFee', get(requestSupporting, 'distanceFee', 0));

          return objectToSnake(
            omit(item.toJSON(), [
              'verify_code',
              'password',
              'createdAt',
              'updatedAt',
              'deletedAt',
              'requestSupportings',
            ])
          );
        }),
      });
    } catch (e) {
      return next(e);
    }
  }

  static async cancelRequestSupporting(req, res, next) {
    try {
      await IssueService.cancelRequestSupporting(req.user, req.issue);

      return res.status(204).json({});
    } catch (e) {
      return next(e);
    }
  }

  static async cancelSupporting(req, res, next) {
    try {
      const issue = await IssueService.cancelSupporting({
        user: req.user,
        receiveIssue: req.receiveIssue,
        data: req.body,
      });
      return res.status(200).json(issue);
    } catch (e) {
      return next(e);
    }
  }

  static async estimate(req, res, next) {
    try {
      const receiveIssue = await IssueService.estimate({
        user: req.user,
        issue: req.issue,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async noticeMaterialCost(req, res, next) {
    try {
      const receiveIssue = await IssueService.noticeMaterialCost({
        user: req.user,
        issue: req.issue,
        data: req.body,
      });
      return res.status(200).json(objectToSnake(receiveIssue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }

  static async update(req, res, next) {
    try {
      const issue = get(req, 'issue');
      const data = get(req, 'body');

      await IssueService.update(issue, data);

      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  }

  static async skip(req, res, next) {
    try {
      const { issue, user } = req;
      await IssueService.skip(user, issue);

      return res.status(204).send();
    } catch (e) {
      return next(e);
    }
  }
}
