import { userRoles } from './user';

export const acl = Object.freeze({
  '/me': {
    GET: [userRoles.WORKER, userRoles.CUSTOMER],
    PATCH: [userRoles.WORKER, userRoles.CUSTOMER],
  },
  '/me/issues': {
    GET: [userRoles.CUSTOMER],
    PATCH: [userRoles.CUSTOMER],
  },
  '/issues': {
    POST: [userRoles.CUSTOMER],
  },
  '/issues/:issueId': {
    DELETE: [userRoles.CUSTOMER],
  },
});
