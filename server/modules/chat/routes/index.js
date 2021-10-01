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
  auth('joinChat'),
  active,
  validator(createChatSchema),
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
  '/chat/:channelId/rating',
  validator(evaluateIssueSchema),
  auth('acceptance'),
  active,
  verifyChannel,
  ChatController.setRating
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

export default router;
