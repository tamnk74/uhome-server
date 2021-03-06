import { Router } from 'express';

import AuthController from '../controllers/auth';

import { auth, validator } from '../../../middlewares';
import loginSchema from '../schema/loginSchema';
import registerSchema from '../schema/registerSchema';

const router = Router();

router.route('/login').post(validator(loginSchema), AuthController.login);
router.route('/register').post(validator(registerSchema), AuthController.register);
router.route('/me').get(auth, AuthController.userInfo);

export default router;
