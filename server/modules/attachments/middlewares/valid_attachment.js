import ApiError from '../../../errors/ApiError';

export default (req, res, next) => {
  const files = req.files ? req.files.filter((file) => file.fieldname === 'files') : [];
  if (!files.length) {
    return next(
      new ApiError({
        message: 'files is requied',
        code: 'FILE-0001',
        status: 400,
        detail: 'files is requied',
      })
    );
  }

  req.files = files;
  next();
};
