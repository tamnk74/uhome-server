import { Router } from 'express';
import multer from 'multer';

import EventController from '../controllers/event';
import { auth } from '../../../middlewares';
import { verifyEvent } from '../middlewares';

const router = Router();

const storage = multer.memoryStorage({
  destination(req, file, callback) {
    callback(null, '');
  },
});
const upload = multer({ storage }).single('file');

router.get('/', auth(), EventController.index);
router.get('/me', auth(), EventController.myEvents);
router.patch('/:id', auth(), upload, EventController.update);
router.get('/:code', auth(), verifyEvent, EventController.getEvent);

export default router;
