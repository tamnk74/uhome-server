import IssueService from '../services/issue';
import { objectToSnake } from '../../../helpers/Util';

export default class AuthController {
  static async create(req, res, next) {
    try {
      const issue = await IssueService.create({
        ...req.body,
        createdBy: req.user.id,
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
      const issue = await IssueService.getDetail(req.issue.id, req.user);
      return res.status(201).json(objectToSnake(issue.toJSON()));
    } catch (e) {
      return next(e);
    }
  }
}
