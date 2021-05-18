import { Router } from 'express';

import ChatController from '../controllers/chat';
import { auth, validator } from '../../../middlewares';
import { createChatSchema, confirmRequestSchema } from '../schema';
import { verifyChannel, verifyRequestType } from '../middlewares';

const router = Router();

router.post('/chat/chat-groups', auth, validator(createChatSchema), ChatController.create);

router.post(
  '/chat/:channelId/confirm',
  auth,
  validator(confirmRequestSchema),
  verifyChannel,
  ChatController.confirmRequest
);
router.get('/chat/:channelId/token', auth, verifyChannel, ChatController.getToken);

router.get(
  '/chat/:channelId/commands/:type',
  auth,
  verifyRequestType,
  verifyChannel,
  ChatController.requestCommand
);
export default router;
