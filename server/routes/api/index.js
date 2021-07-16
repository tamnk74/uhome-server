import { Router } from 'express';
import UserRouter from '../../modules/users/routes';
import CategoryRouter from '../../modules/categories/routes';
import AttchmentRouter from '../../modules/attachments/routes';
import IssueRouter from '../../modules/issues/routes';
import ChatRouter from '../../modules/chat/routes';
import PaymentRouter from '../../modules/payment/routes';
import EventRouter from '../../modules/event/routes';

const router = Router();

router.use('/', UserRouter);
router.use('/', CategoryRouter);
router.use('/', AttchmentRouter);
router.use('/', IssueRouter);
router.use('/', ChatRouter);
router.use('/', PaymentRouter);
router.use('/events', EventRouter);

export default router;
