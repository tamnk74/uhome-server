import { Router } from 'express';
import multer from 'multer';

import AuthController from '../controllers/auth';
import UserController from '../controllers/user';

import { auth, validator } from '../../../middlewares';
import validFile from '../middlewares/validFile';
import {
  loginSchema,
  registerSchema,
  loginFbSchema,
  loginZaloSchema,
  updateUserSchema,
  verifyCodeSchema,
  uploadFileschema,
  updateSkillsSchema,
  subscriptionSchema,
  setRoleSchema,
  resetPasswordSchema,
  phoneNumberSchema,
  refreshTokenSchema,
  latestLocationSchema,
  updatePasswordSchema,
} from '../schema';

import { verifyUser } from '../middlewares';

const router = Router();

const storage = multer.memoryStorage({
  destination(req, file, callback) {
    callback(null, '');
  },
});
const upload = multer({ storage }).single('file');

router.route('/login').post(validator(loginSchema), AuthController.login);
router.route('/logout').post(auth, AuthController.logout);
router.route('/auth/facebook').post(validator(loginFbSchema), AuthController.loginFb);
router.route('/auth/zalo').post(validator(loginZaloSchema), AuthController.loginZalo);
router.route('/register').post(validator(registerSchema), AuthController.register);
router.route('/auth/token').post(validator(setRoleSchema), AuthController.authorize);
router.route('/refresh-token').post(validator(refreshTokenSchema), AuthController.refreshToken);
router.route('/me').get(auth, AuthController.userInfo);
router.route('/me').patch(auth, validator(updateUserSchema), AuthController.updateUser);
router.route('/users/:userId/verify').patch(validator(verifyCodeSchema), AuthController.verifyCode);
router.route('/me/issues').get(auth, UserController.getIssues);
router.route('/users/:id/receive-issues').get(auth, verifyUser, UserController.getReceiveIssues);
router.route('/users/:userId').get(auth, UserController.getUserProfile);
router.route('/me/skills').post(auth, validator(updateSkillsSchema), UserController.skills);

router
  .route('/me/upload-file')
  .post(auth, upload, validFile, validator(uploadFileschema), UserController.uploadFile);

router.route('/me/subscribe').post(auth, validator(subscriptionSchema), UserController.subscribe);
router
  .route('/me/unsubscribe')
  .post(auth, validator(subscriptionSchema), UserController.unsubscribe);

router.post('/forgot-password', validator(phoneNumberSchema), AuthController.resetPassword);
router.post(
  '/forgot-password/:userId/verify',
  validator(verifyCodeSchema),
  AuthController.verifyResetPassword
);
router.patch('/forgot-password', validator(resetPasswordSchema), AuthController.changePassword);

router
  .route('/me/latest-location')
  .put(auth, validator(latestLocationSchema), UserController.storeLatestLocation);

router
  .route('/me/password')
  .put(auth, validator(updatePasswordSchema), UserController.updatePassword);

export default router;
