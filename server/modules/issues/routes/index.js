import { Router } from 'express';

import IssueController from '../controllers/issue';
import { auth, validator, active, verified } from '../../../middlewares';
import {
  verifyAttachments,
  verifyIssue,
  verifyIssueSupport,
  validIssueSupport,
  verifyOwnerIssue,
  verifyCategory,
  verifySaleEvent,
  verifyPhoneNumber,
  verifyWorkerLocation,
} from '../middlewares';
import {
  createIssueSchema,
  cancelIssueSchema,
  estimationSchema,
  materialCostSchema,
  updateIssueSchema,
  requestSupportSchema,
} from '../schema';
import { verifyLocation } from '../middlewares/verifyLocation';

const router = Router();

router.get('/issues/videos', auth('createIssue'), active, IssueController.getUploadVideoLink);
router.post(
  '/issues',
  auth('createIssue'),
  active,
  validator(createIssueSchema),
  verifyAttachments,
  verifyLocation,
  verifySaleEvent,
  verifyPhoneNumber,
  IssueController.create
);
router.delete(
  '/issues/:issueId',
  auth('deleteIssue'),
  active,
  verifyOwnerIssue,
  IssueController.remove
);
router.get('/issues/:issueId', auth('getIssue'), active, verifyIssue, IssueController.show);
router.get('/issues', auth('getIssues'), active, IssueController.index);

router.post(
  '/issues/:issueId/request-supportings',
  auth('requestSupport'),
  verified,
  verifyWorkerLocation,
  validator(requestSupportSchema),
  verifyPhoneNumber,
  verifyIssue,
  verifyCategory,
  IssueController.requestSupporting
);

router.get(
  '/issues/:issueId/request-supportings',
  auth('joinChat'),
  active,
  verifyIssue,
  IssueController.getRequestSupporting
);
router.patch(
  '/issues/:issueId/cancel',
  validator(cancelIssueSchema),
  auth('cancelSupport'),
  active,
  verifyIssueSupport,
  IssueController.cancelSupporting
);

router.delete(
  '/issues/:issueId/request-supportings',
  auth('cancelSupport'),
  active,
  verifyIssue,
  IssueController.cancelRequestSupporting
);

router.post(
  '/issues/:issueId/estimation',
  auth('sendEstimationCost'),
  verified,
  validator(estimationSchema),
  validIssueSupport,
  IssueController.estimate
);

router.post(
  '/issues/:issueId/material-cost',
  auth('sendMaterialCost'),
  verified,
  validator(materialCostSchema),
  validIssueSupport,
  IssueController.noticeMaterialCost
);

router.patch(
  '/issues/:issueId',
  auth('updateIssue'),
  active,
  verifyOwnerIssue,
  validator(updateIssueSchema),
  IssueController.update
);

export default router;
