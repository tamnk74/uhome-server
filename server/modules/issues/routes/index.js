import { Router } from 'express';

import IssueController from '../controllers/issue';
import { auth, validator } from '../../../middlewares';
import {
  verifyAttachments,
  verifyIssue,
  verifyIssueSupport,
  validIssueSupport,
} from '../middlewares';
import { createIssueSchema, cancelIssueSchema } from '../schema';

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

router.get(
  '/issues/:issueId/request-supportings',
  auth,
  validIssueSupport,
  IssueController.getRequestSupporting
);
router.patch(
  '/issues/:issueId/cancel',
  validator(cancelIssueSchema),
  auth,
  verifyIssueSupport,
  IssueController.cancelSupporting
);

router.delete(
  '/issues/:issueId/request-supportings',
  auth,
  validIssueSupport,
  IssueController.cancelRequestSupporting
);

export default router;
