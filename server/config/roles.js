const allRoles = {
  ADMIN: ['updateIssue', 'getIssue', 'getIssues', 'deleteIssue', 'joinChat'],
  CONSULTING: ['getIssue', 'getIssues', 'joinChat'],
  CUSTOMER: [
    'createIssue',
    'updateIssue',
    'getIssue',
    'getIssues',
    'deleteIssue',
    'joinChat',
    'cancelSupport',
    'requestEstimationCost',
    'requestMaterialCost',
    'approveEstimationCost',
    'approveMaterialCost',
    'acceptance',
    'requestUpdateProgress',
    'actionOnChat',
    'changeSessionRole',
  ],
  WORKER: [
    'getIssues',
    'getIssue',
    'actionOnChat',
    'requestSupport',
    'cancelSupport',
    'sendEstimationCost',
    'sendMaterialCost',
    'requestAcceptance',
    'updatedProgress',
    'joinChat',
    'changeSessionRole',
    'complete',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
