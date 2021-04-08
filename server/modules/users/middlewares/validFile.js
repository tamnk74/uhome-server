import ApiError from '../../../errors/ApiError';

export default (req, res, next) => {
  if (!req.file) {
    return next(
      new ApiError({
        message: 'file is required',
        code: 'FILE-0002',
        status: 400,
        detail: 'file is required',
      })
    );
  }

  next();
};
