export const httpError = Object.freeze({
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
});

export const paymentStatus = Object.freeze({
  OPEN: 'OPEN',
  PAID: 'PAID',
  FAIL: 'FAIL',
});

export const paymentType = Object.freeze({
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
});

export const paymentMethod = Object.freeze({
  SYSTEM: 'system',
  MOMO: 'momo',
  CASH: 'cash',
});

export const currencies = Object.freeze({
  VND: 'VND',
  USD: 'USD',
});

export const appTypes = Object.freeze({
  ANDROID: 'android',
  IOS: 'ios',
});

export const saleEventTypes = Object.freeze({
  DISCOUNT: 'discount',
  BONUS: 'bonus',
  VOUCHER: 'voucher',
});

export const eventStatuses = Object.freeze({
  DEACTIVE: 0,
  ACTIVE: 1,
});
