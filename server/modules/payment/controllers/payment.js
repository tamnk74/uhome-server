import { objectToSnake } from '../../../helpers/Util';
import { PaymentService } from '../services';

export default class PaymentController {
  static async process(req, res, next) {
    try {
      const result = await PaymentService.process(req.body);
      return res.status(201).json(objectToSnake(result));
    } catch (e) {
      return next(e);
    }
  }
}
