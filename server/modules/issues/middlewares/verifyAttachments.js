import Attachment from '../../../models/attachment';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyAttachments = async (req, res, next) => {
  try {
    const attachments = await Attachment.findAll({
      where: {
        id: req.body.attachmentIds || [],
        issueId: null,
      },
    });

    if (req.body.attachmentIds && attachments.length !== req.body.attachmentIds.length) {
      return next(errorFactory.getError('ATTA-0001'));
    }

    req.attachments = attachments;
    return next();
  } catch (e) {
    return next(e);
  }
};
