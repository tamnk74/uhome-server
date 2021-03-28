import { Router } from 'express';
import UserRouter from '../../modules/users/routes';
import CategoryRouter from '../../modules/categories/routes';
import AttchmentRouter from '../../modules/attachments/routes';
import IssueRouter from '../../modules/issues/routes';
import ChatRouter from '../../modules/chat/routes';

const router = Router();

router.use('/', UserRouter);
router.use('/', CategoryRouter);
router.use('/', AttchmentRouter);
router.use('/', IssueRouter);
router.use('/', ChatRouter);

export default router;
