import httpStatus from 'http-status';

class ApiError extends Error {
  constructor({ message, code, detail, status = 500 }) {
    super(message);
    this.code = code;
    this.status = status;
    this.title = httpStatus[status];
    this.detail = detail;
  }
}

export default ApiError;
