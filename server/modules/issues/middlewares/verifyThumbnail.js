import errorFactory from 'errors/ErrorFactory';

export const verifyThumbnail = (req, res, next) => {
  if (!req.file) {
    return next(errorFactory.getError('FILE-0003'));
  }

  if (
    !['image/png', 'image/gif', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/bmp'].includes(
      req.file.mimetype
    )
  ) {
    return next(errorFactory.getError('FILE-0004'));
  }

  req.thumbnail = req.file;
  next();
};
