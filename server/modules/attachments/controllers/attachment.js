import AttachmentService from '../services/attachment';

export default class AttachmentController {
  static async store(req, res, next) {
    try {
      const attachments = await AttachmentService.upload(req);

      return res.status(200).json(attachments);
    } catch (e) {
      return next(e);
    }
  }
}
