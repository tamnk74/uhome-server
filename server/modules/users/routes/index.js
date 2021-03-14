import { Router } from 'express';

import AuthController from '../controllers/auth';
import UserController from '../controllers/user';

import { auth, validator } from '../../../middlewares';
import {
  loginSchema,
  registerSchema,
  loginFbSchema,
  loginZaloSchema,
  updateUserSchema,
  verifyCodeSchema,
} from '../schema';

const router = Router();

router.route('/login').post(validator(loginSchema), AuthController.login);
router.route('/logout').post(auth, AuthController.logout);
router.route('/auth/facebook').post(validator(loginFbSchema), AuthController.loginFb);
router.route('/auth/zalo').post(validator(loginZaloSchema), AuthController.loginZalo);
router.route('/register').post(validator(registerSchema), AuthController.register);
router.route('/me').get(auth, AuthController.userInfo);
router.route('/me').patch(auth, validator(updateUserSchema), AuthController.updateUser);
router.route('/users/:userId/verify').patch(validator(verifyCodeSchema), AuthController.verifyCode);
router.route('/me/issues').get(auth, UserController.getIssues);

export default router;
