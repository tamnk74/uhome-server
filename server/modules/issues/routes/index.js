import { Router } from 'express';

import IssueController from '../controllers/issue';
import { auth, validator } from '../../../middlewares';
import { verifyAttachments } from '../middlewares';
import { createIssueSchema } from '../schema';

const router = Router();

router.post(
  '/issues',
  auth,
  validator(createIssueSchema),
  verifyAttachments,
  IssueController.create
);
router.delete('/issues/:issueId', auth, IssueController.remove);

export default router;
