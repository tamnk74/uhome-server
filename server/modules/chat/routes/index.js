import { Router } from 'express';

import ChatController from '../controllers/chat';
import { auth, validator, active } from '../../../middlewares';
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
  active,
  validator(createChatSchema),
  isAllowCreateGroupChat,
  ChatController.create
);

router.get('/chat/:channelId/token', auth, active, verifyChannel, ChatController.getToken);

router.get(
  '/chat/:channelId/commands/:type',
  auth,
  active,
  verifyRequestType,
  verifyChannel,
  ChatController.requestCommand
);

router.post(
  '/chat/:channelId/approval-time',
  auth,
  active,
  validator(approveEstimateTimeSchema),
  verifyChannel,
  ChatController.approveEstimateTime
);

router.post(
  '/chat/:channelId/approval-material-cost',
  auth,
  active,
  validator(approveMaterialCostSchema),
  verifyChannel,
  ChatController.approveMaterialCost
);

router.post(
  '/chat/:channelId/tracking',
  auth,
  active,
  validator(trackingSchema),
  verifyChannel,
  ChatController.trakingProgress
);

router.post(
  '/chat/:channelId/rating',
  validator(evaluateIssueSchema),
  auth,
  active,
  verifyChannel,
  ChatController.setRating
);

router.post(
  '/chat/:channelId/continue',
  validator(continueChattingchema),
  auth,
  active,
  verifyChannel,
  ChatController.continueChatting
);

router.post(
  '/chat/:channelId/informations',
  validator(trackingSchema),
  auth,
  active,
  verifyChannel,
  ChatController.addMoreInformation
);

export default router;
