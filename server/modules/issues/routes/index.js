import { Router } from 'express';

import IssueController from '../controllers/issue';
import { auth, validator } from '../../../middlewares';
import { verifyAttachments, verifyIssue, validIssueSupport } from '../middlewares';
import { createIssueSchema } from '../schema';

const router = Router();

router.post(
  '/issues',
  auth,
  validator(createIssueSchema),
  verifyAttachments,
  IssueController.create
);
router.delete('/issues/:issueId', auth, verifyIssue, IssueController.remove);
router.get('/issues/:issueId', auth, verifyIssue, IssueController.show);
router.get('/issues', auth, IssueController.index);
router.post(
  '/issues/:issueId/request-supportings',
  auth,
  validIssueSupport,
  IssueController.requestSupporting
);

export default router;
