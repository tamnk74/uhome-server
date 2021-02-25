import { Router } from 'express';

import AuthController from '../controllers/auth';

import { auth, validator } from '../../../middlewares';
import loginSchema from '../schema/loginSchema';

const router = Router();

router.route('/login').post(validator(loginSchema), AuthController.login);
router.route('/me').get(auth, AuthController.userInfo);

export default router;
