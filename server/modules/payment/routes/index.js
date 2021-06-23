import { Router } from 'express';

import PaymentController from '../controllers/payment';
import { validator } from '../../../middlewares';
import { paymentSchema } from '../schema';

const router = Router();

router.post('/payment', validator(paymentSchema), PaymentController.process);

export default router;
