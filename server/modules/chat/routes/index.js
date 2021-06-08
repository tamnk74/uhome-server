import { Router } from 'express';

import ChatController from '../controllers/chat';
import { auth, validator } from '../../../middlewares';
import {
  createChatSchema,
  approveEstimateTimeSchema,
  approveMaterialCostSchema,
  trackingSchema,
  evaluateIssueSchema,
  continueChattingchema,
} from '../schema';
import { verifyChannel, verifyRequestType, isAllowCreateGroupChat } from '../middlewares';

const router = Router();

router.post(
  '/chat/chat-groups',
  auth,
  validator(createChatSchema),
  isAllowCreateGroupChat,
  ChatController.create
);

router.get('/chat/:channelId/token', auth, verifyChannel, ChatController.getToken);

router.get(
  '/chat/:channelId/commands/:type',
  auth,
  verifyRequestType,
  verifyChannel,
  ChatController.requestCommand
);

router.post(
  '/chat/:channelId/approval-time',
  auth,
  validator(approveEstimateTimeSchema),
  verifyChannel,
  ChatController.approveEstimateTime
);

router.post(
  '/chat/:channelId/approval-material-cost',
  auth,
  validator(approveMaterialCostSchema),
  verifyChannel,
  ChatController.approveMaterialCost
);

router.post(
  '/chat/:channelId/tracking',
  auth,
  validator(trackingSchema),
  verifyChannel,
  ChatController.trakingProgress
);

router.post(
  '/chat/:channelId/rating',
  validator(evaluateIssueSchema),
  auth,
  verifyChannel,
  ChatController.setRating
);

router.post(
  '/chat/:channelId/continue',
  validator(continueChattingchema),
  auth,
  verifyChannel,
  ChatController.continueChatting
);

router.post(
  '/chat/:channelId/informations',
  validator(trackingSchema),
  auth,
  verifyChannel,
  ChatController.addMoreInformation
);

export default router;
