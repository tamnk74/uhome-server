import { objectToSnake } from '../../../helpers/Util';
import { PaymentService } from '../services';

export default class PaymentController {
  static async process(req, res, next) {
    try {
      const { receiveIssue } = req;
      const result = await PaymentService.process(receiveIssue, req.body);
      return res.status(201).json(objectToSnake(result));
    } catch (e) {
      return next(e);
    }
  }

  static async confirm(req, res, next) {
    try {
      const result = await PaymentService.confirmMomo(req.body);
      return res.status(200).json(result);
    } catch (e) {
      return next(e);
    }
  }
}