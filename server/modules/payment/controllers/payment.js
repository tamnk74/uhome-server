import { objectToSnake } from '../../../helpers/Util';
import { PaymentService } from '../services';

export default class PaymentController {
  static async payin(req, res, next) {
    try {
      const { user } = req;
      const result = await PaymentService.process(user, req.body);

      return res.status(201).json(objectToSnake(result));
    } catch (e) {
      return next(e);
    }
  }

  static async payment(req, res, next) {
    try {
      const { user, issue } = req;
      const result = await PaymentService.payment({ user, issue });

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
