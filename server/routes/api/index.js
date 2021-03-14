import { Router } from 'express';
import UserRouter from '../../modules/users/routes';
import CategoryRouter from '../../modules/categories/routes';
import AttchmentRouter from '../../modules/attachments/routes';
import IssueRouter from '../../modules/issues/routes';

const router = Router();

router.use('/', UserRouter);
router.use('/', CategoryRouter);
router.use('/', AttchmentRouter);
router.use('/', IssueRouter);

export default router;
