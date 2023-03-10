import { Router } from 'express';
import multer from 'multer';

import AuthController from '../controllers/auth';
import UserController from '../controllers/user';

import { auth, validator, active, basicAuth } from '../../../middlewares';
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
  updatePhoneNumberSchema,
  loginAppleSchema,
  logoutSchema,
} from '../schema';

import { verifyPhoneNumber, verifyUser } from '../middlewares';

const router = Router();

const storage = multer.memoryStorage({
  destination(req, file, callback) {
    callback(null, '');
  },
});
const upload = multer({ storage }).single('file');

router.route('/login').post(validator(loginSchema), AuthController.login);
router.route('/logout').post(auth(), validator(logoutSchema), AuthController.logout);
router.route('/auth/facebook').post(validator(loginFbSchema), AuthController.loginFb);
router.route('/auth/zalo').post(validator(loginZaloSchema), AuthController.loginZalo);
router.route('/register').post(basicAuth, validator(registerSchema), AuthController.register);
router
  .route('/me/session-roles')
  .put(
    auth('changeSessionRole'),
    active,
    validator(setRoleSchema),
    UserController.changeSessionRole
  );
router.route('/refresh-token').post(validator(refreshTokenSchema), AuthController.refreshToken);
router.route('/me').get(auth(), AuthController.userInfo);
router.route('/me').patch(auth(), active, validator(updateUserSchema), AuthController.updateUser);
router
  .route('/me/phone-number')
  .post(
    auth(),
    active,
    validator(updatePhoneNumberSchema),
    verifyPhoneNumber,
    AuthController.verifyPhoneNumber
  );
router
  .route('/me/phone-number')
  .patch(auth(), active, validator(verifyCodeSchema), AuthController.updatePhoneNumber);
router
  .route('/users/:userId/verify')
  .patch(basicAuth, validator(verifyCodeSchema), AuthController.verifyCode);
router.route('/me/issues').get(auth(), active, UserController.getIssues);
router
  .route('/users/:id/receive-issues')
  .get(auth(), active, verifyUser, UserController.getReceiveIssues);
router.route('/users/:userId').get(auth(), active, UserController.getUserProfile);
router
  .route('/me/skills')
  .post(auth(), active, validator(updateSkillsSchema), UserController.skills);

router
  .route('/me/upload-file')
  .post(auth(), active, upload, validFile, validator(uploadFileschema), UserController.uploadFile);

router
  .route('/me/subscribe')
  .post(auth(), active, validator(subscriptionSchema), UserController.subscribe);
router
  .route('/me/unsubscribe')
  .post(auth(), active, validator(subscriptionSchema), UserController.unsubscribe);

router.post(
  '/forgot-password',
  basicAuth,
  validator(phoneNumberSchema),
  AuthController.resetPassword
);
router.post(
  '/forgot-password/:userId/verify',
  validator(verifyCodeSchema),
  AuthController.verifyResetPassword
);
router.patch('/forgot-password', validator(resetPasswordSchema), AuthController.changePassword);

router
  .route('/me/latest-location')
  .put(auth(), active, validator(latestLocationSchema), UserController.storeLatestLocation);

router
  .route('/me/password')
  .put(auth(), active, validator(updatePasswordSchema), UserController.updatePassword);

router
  .route('/me/transaction-histories')
  .get(auth(), active, UserController.getTransactionHistories);
router.route('/users/:id/send-otp').put(basicAuth, UserController.sendOTP);

router.route('/auth/apple').post(validator(loginAppleSchema), AuthController.appleLogin);

router.route('/me/latest-issue-statuses').get(auth(), active, UserController.getLatestIssueStatus);

export default router;
