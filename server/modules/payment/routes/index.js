import { Router } from 'express';

import PaymentController from '../controllers/payment';
import { validator } from '../../../middlewares';
import { paymentSchema, confirmPaymentSchema } from '../schema';
import { verifyReceiveIssue } from '../middlewares';

const router = Router();

router.post(
  '/:receiveIssueId/payment',
  validator(paymentSchema),
  verifyReceiveIssue,
  PaymentController.process
);
router.post('/payment/confirm', validator(confirmPaymentSchema), PaymentController.confirm);

export default router;
