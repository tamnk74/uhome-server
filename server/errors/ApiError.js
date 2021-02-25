import { httpError } from '../constants/app';

class ApiError extends Error {
  constructor({ message, code, detail, stack, status = 500 }) {
    super(message);
    this.code = code;
    this.status = status;
    this.title = httpError[status];
    this.detail = detail;
    this.stack = stack;
  }
}

export default ApiError;
