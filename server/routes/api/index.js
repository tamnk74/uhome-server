import { Router } from 'express';
import UserRouter from '../../modules/users/routes';

const router = Router();

router.use('/', UserRouter);

export default router;
