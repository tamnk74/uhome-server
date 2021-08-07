import { Router } from 'express';

import PaymentController from '../controllers/payment';
import { validator, auth } from '../../../middlewares';
import { paymentSchema, confirmPaymentSchema } from '../schema';
import { verifyIssue } from '../middlewares';

const router = Router();

router.post('/me/pay-in', validator(paymentSchema), auth, PaymentController.payin);
router.post('/issues/:issueId/payment', auth, verifyIssue, PaymentController.payment);
router.post('/payment/confirm', validator(confirmPaymentSchema), PaymentController.confirm);

export default router;
