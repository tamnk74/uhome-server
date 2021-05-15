import { Router } from 'express';

import ChatController from '../controllers/chat';
import { auth, validator } from '../../../middlewares';
import { createChatSchema, commandChatSchema, confirmRequestSchema } from '../schema';
import { verifyChannel } from '../middlewares';

const router = Router();

router.post('/chat/chat-groups', auth, validator(createChatSchema), ChatController.create);
router.post(
  '/chat/:channelId/commands',
  auth,
  validator(commandChatSchema),
  verifyChannel,
  ChatController.sendCommand
);
router.post(
  '/chat/:channelId/confirm',
  auth,
  validator(confirmRequestSchema),
  verifyChannel,
  ChatController.confirmRequest
);
router.get('/chat/:channelId/token', auth, verifyChannel, ChatController.getToken);

export default router;
