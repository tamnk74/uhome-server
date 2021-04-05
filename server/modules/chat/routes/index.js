import { Router } from 'express';

import ChatController from '../controllers/chat';
import { auth, validator } from '../../../middlewares';
import { createChatSchema, commandChatSchema } from '../schema';
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

export default router;
