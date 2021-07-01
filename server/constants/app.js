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
});

export const currencies = Object.freeze({
  VND: 'VND',
  USD: 'USD',
});
