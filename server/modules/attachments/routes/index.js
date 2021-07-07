import { Router } from 'express';
import multer from 'multer';

import AttachmentController from '../controllers/attachment';
import { auth, active } from '../../../middlewares';
import validAttachment from '../middlewares/valid_attachment';

const router = Router();
const storage = multer.memoryStorage({
  destination(req, file, callback) {
    callback(null, '');
  },
});
const multipleUpload = multer({ storage }).array('files');

router
  .route('/attachments')
  .post(auth, active, multipleUpload, validAttachment, AttachmentController.store);

export default router;
