import { Router } from 'express';

import EventController from '../controllers/event';
import { auth } from '../../../middlewares';

const router = Router();

router.get('/', auth, EventController.index);

export default router;
