import { Router } from 'express';
import multer from 'multer';

import EventController from '../controllers/event';
import { auth } from '../../../middlewares';

const router = Router();

const storage = multer.memoryStorage({
  destination(req, file, callback) {
    callback(null, '');
  },
});
const upload = multer({ storage }).single('file');

router.get('/', auth, EventController.index);
router.patch('/:id', auth, upload, EventController.update);

export default router;
