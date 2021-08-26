export const status = Object.freeze({
  IN_ACTIVE: 0,
  ACTIVE: 1,
});

export const userRoles = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  WORKER: 'WORKER',
});

export const roles = Object.freeze({
  USER: 'USER',
  ADMIN: 'ADMIN',
});

export const socialAccount = Object.freeze({
  FACEBOOK: 'FACEBOOK',
  ZALO: 'ZALO',
});

export const gender = Object.freeze({
  MALE: 0,
  FEMALE: 1,
  OTHER: 2,
});

export const fileType = Object.freeze({
  AVATAR: 'avatar',
  IDENTITY_CARD_BEFORE: 'identity_card_before',
  IDENTITY_CARD_AFTER: 'identity_card_after',
});

export const idCardStatus = Object.freeze({
  NOT_VERIFY: 0,
  WAITING_VERIFY_CARD: 1,
  VERIFIED: 2,
  FAIL_VERIFIED: 3,
});

export const withdrawStatus = Object.freeze({
  OPEN: 'OPEN',
  CANCELED: 'CANCELED',
  DONE: 'DONE',
  FAILED: 'FAILED',
});
