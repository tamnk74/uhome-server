import { Router } from 'express';

import PaymentController from '../controllers/payment';
import { validator, auth } from '../../../middlewares';
import { paymentSchema, confirmPaymentSchema, withdrawSchema } from '../schema';
import { verifyCheckoutIssue, verifyIssue } from '../middlewares';

const router = Router();

router.post('/me/pay-in', validator(paymentSchema), auth(), PaymentController.payin);
router.post('/issues/:issueId/payment', auth(), verifyIssue, PaymentController.payment);
router.post('/payment/confirm', validator(confirmPaymentSchema), PaymentController.confirm);
router.post('/me/withdraw', auth(), validator(withdrawSchema), PaymentController.withdraw);
router.post(
  '/issues/:issueId/checkout',
  validator(paymentSchema),
  auth(),
  verifyCheckoutIssue,
  PaymentController.checkout
);

export default router;
