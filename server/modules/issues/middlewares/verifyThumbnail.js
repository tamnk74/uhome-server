import ApiError from '../../../errors/ApiError';

export const verifyThumbnail = (req, res, next) => {
  if (!req.file) {
    return next(
      new ApiError({
        message: 'thumbnail is requied',
        code: 'FILE-0003',
        status: 400,
        detail: 'thumbnail is requied',
      })
    );
  }

  if (
    !['image/png', 'image/gif', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/bmp'].includes(
      req.file.mimetype
    )
  ) {
    return next(
      new ApiError({
        message: 'thumbnail must be a file',
        code: 'FILE-0004',
        status: 400,
        detail: 'thumbnail must be a file',
      })
    );
  }

  req.thumbnail = req.file;
  next();
};
