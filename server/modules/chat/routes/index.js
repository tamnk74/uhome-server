import { Router } from 'express';

import ChatController from '../controllers/chat';
import { auth, validator } from '../../../middlewares';
import { createChatSchema } from '../schema';

const router = Router();

router.post('/chat/chat-groups', auth, validator(createChatSchema), ChatController.create);

export default router;
