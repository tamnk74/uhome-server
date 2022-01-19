import { Router } from 'express';
import ChatController from '../controllers/chat';
import { auth, validator, active } from '../../../middlewares';
import {
  createChatSchema,
  approveEstimateTimeSchema,
  approveMaterialCostSchema,
  trackingSchema,
  acceptanceIssueSchema,
  continueChattingchema,
  joinChatSchema,
  uploadVideoSchema,
  addPromotionSchema,
} from '../schema';
import {
  verifyChannel,
  verifyRequestType,
  isAllowCreateGroupChat,
  isValidCompletion,
  validIssue,
} from '../middlewares';

const router = Router();

router.post(
  '/chat/chat-groups',
  auth('joinChat'),
  active,
  validator(createChatSchema),
  validIssue,
  isAllowCreateGroupChat,
  ChatController.create
);

router.get(
  '/chat/:channelId/token',
  auth('joinChat'),
  active,
  verifyChannel,
  ChatController.getToken
);

router.get(
  '/chat/:channelId/commands/:type',
  auth('actionOnChat'),
  active,
  verifyRequestType,
  verifyChannel,
  ChatController.requestCommand
);

router.get(
  '/chat/:channelId/videos',
  auth('actionOnChat'),
  active,
  verifyChannel,
  ChatController.getUploadVideoLink
);

router.post(
  '/chat/:channelId/videos',
  auth('actionOnChat'),
  active,
  validator(uploadVideoSchema),
  verifyChannel,
  ChatController.sendUploadVideoMessage
);

router.post(
  '/chat/:channelId/approval-time',
  auth('approveEstimationCost'),
  active,
  validator(approveEstimateTimeSchema),
  verifyChannel,
  ChatController.approveEstimateTime
);

router.post(
  '/chat/:channelId/approval-material-cost',
  auth('approveMaterialCost'),
  active,
  validator(approveMaterialCostSchema),
  verifyChannel,
  ChatController.approveMaterialCost
);

router.post(
  '/chat/:channelId/tracking',
  auth('actionOnChat'),
  active,
  validator(trackingSchema),
  verifyChannel,
  ChatController.trakingProgress
);

router.post(
  '/chat/:channelId/acceptances',
  validator(acceptanceIssueSchema),
  auth('acceptance'),
  active,
  verifyChannel,
  ChatController.acceptPayment
);

router.post(
  '/chat/:channelId/continue',
  validator(continueChattingchema),
  auth('actionOnChat'),
  active,
  verifyChannel,
  ChatController.continueChatting
);

router.post(
  '/chat/:channelId/informations',
  validator(trackingSchema),
  auth('actionOnChat'),
  active,
  verifyChannel,
  ChatController.addMoreInformation
);

router.post('/chat/post-webhooks', ChatController.postWebhook);

router.post(
  '/chat/:channelId/promotions',
  auth(),
  active,
  validator(addPromotionSchema),
  verifyChannel,
  ChatController.addPromotion
);

router.post(
  '/chat/:channelId/completions',
  auth('complete'),
  active,
  verifyChannel,
  isValidCompletion,
  ChatController.finish
);

router.post(
  '/chat/histories',
  auth('joinChat'),
  active,
  validator(joinChatSchema),
  ChatController.joinChatHistory
);

export default router;
