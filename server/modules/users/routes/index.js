import { Router } from 'express';

import AuthController from '../controllers/auth';

import { auth, validator } from '../../../middlewares';
import {
  loginSchema,
  registerSchema,
  loginFbSchema,
  loginZaloSchema,
  updateUserSchema,
} from '../schema';

const router = Router();

router.route('/login').post(validator(loginSchema), AuthController.login);
router.route('/auth/facebook').post(validator(loginFbSchema), AuthController.loginFb);
router.route('/auth/zalo').post(validator(loginZaloSchema), AuthController.loginZalo);
router.route('/register').post(validator(registerSchema), AuthController.register);
router.route('/me').get(auth, AuthController.userInfo);
router.route('/me').patch(auth, validator(updateUserSchema), AuthController.updateUser);

export default router;
