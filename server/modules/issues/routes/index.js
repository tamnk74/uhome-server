import { Router } from 'express';

import IssueController from '../controllers/issue';
import { auth, validator, active } from '../../../middlewares';
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
  updateIssueSchema,
} from '../schema';

const router = Router();

router.post(
  '/issues',
  auth,
  active,
  validator(createIssueSchema),
  verifyAttachments,
  IssueController.create
);
router.delete('/issues/:issueId', auth, active, verifyOwnerIssue, IssueController.remove);
router.get('/issues/:issueId', auth, active, verifyIssue, IssueController.show);
router.get('/issues', auth, active, IssueController.index);
router.post(
  '/issues/:issueId/request-supportings',
  auth,
  active,
  verifyIssue,
  IssueController.requestSupporting
);

router.get(
  '/issues/:issueId/request-supportings',
  auth,
  active,
  verifyIssue,
  IssueController.getRequestSupporting
);
router.patch(
  '/issues/:issueId/cancel',
  validator(cancelIssueSchema),
  auth,
  active,
  verifyIssueSupport,
  IssueController.cancelSupporting
);

router.delete(
  '/issues/:issueId/request-supportings',
  auth,
  active,
  verifyIssue,
  IssueController.cancelRequestSupporting
);

router.post(
  '/issues/:issueId/estimation',
  auth,
  active,
  validator(estimationSchema),
  validIssueSupport,
  IssueController.estimate
);

router.post(
  '/issues/:issueId/material-cost',
  auth,
  active,
  validator(materialCostSchema),
  validIssueSupport,
  IssueController.noticeMaterialCost
);

router.patch(
  '/issues/:issueId',
  auth,
  active,
  verifyOwnerIssue,
  validator(updateIssueSchema),
  IssueController.update
);

export default router;
