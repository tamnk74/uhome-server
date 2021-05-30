import { Router } from 'express';

import IssueController from '../controllers/issue';
import { auth, validator } from '../../../middlewares';
import {
  verifyAttachments,
  verifyIssue,
  verifyIssueSupport,
  validIssueSupport,
  verifyOwnerIssue,
} from '../middlewares';
import {
  createIssueSchema,
  cancelIssueSchema,
  estimationSchema,
  materialCostSchema,
} from '../schema';

const router = Router();

router.post(
  '/issues',
  auth,
  validator(createIssueSchema),
  verifyAttachments,
  IssueController.create
);
router.delete('/issues/:issueId', auth, verifyOwnerIssue, IssueController.remove);
router.get('/issues/:issueId', auth, verifyIssue, IssueController.show);
router.get('/issues', auth, IssueController.index);
router.post(
  '/issues/:issueId/request-supportings',
  auth,
  verifyIssue,
  IssueController.requestSupporting
);

router.get(
  '/issues/:issueId/request-supportings',
  auth,
  verifyIssue,
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
  verifyIssue,
  IssueController.cancelRequestSupporting
);

router.post(
  '/issues/:issueId/estimation',
  auth,
  validator(estimationSchema),
  validIssueSupport,
  IssueController.estimate
);

router.post(
  '/issues/:issueId/material-cost',
  auth,
  validator(materialCostSchema),
  validIssueSupport,
  IssueController.noticeMaterialCost
);

export default router;
