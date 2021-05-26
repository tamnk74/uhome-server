import { Router } from 'express';

import ChatController from '../controllers/chat';
import { auth, validator } from '../../../middlewares';
import {
  createChatSchema,
  approveEstimateCostSchema,
  approveEstimateTimeSchema,
  approveMaterialCostSchema,
} from '../schema';
import { verifyChannel, verifyRequestType } from '../middlewares';

const router = Router();

router.post('/chat/chat-groups', auth, validator(createChatSchema), ChatController.create);

router.post(
  '/chat/:channelId/approval-cost',
  auth,
  validator(approveEstimateCostSchema),
  verifyChannel,
  ChatController.approveEstimateCost
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

export default router;
