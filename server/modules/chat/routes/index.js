import { Router } from 'express';

import ChatController from '../controllers/chat';
import { auth, validator } from '../../../middlewares';
import {
  createChatSchema,
  approveEstimateTimeSchema,
  approveMaterialCostSchema,
  trackingSchema,
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

export default router;
