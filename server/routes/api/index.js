import { Router } from 'express';
import UserRouter from '../../modules/users/routes';
import CategoryRouter from '../../modules/categories/routes';

const router = Router();

router.use('/', UserRouter);
router.use('/', CategoryRouter);

export default router;
