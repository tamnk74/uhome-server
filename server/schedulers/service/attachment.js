import Attachment from '../../models/attachment';
import Uploader from '../../helpers/Uploader';

export default class AttachmentService {
  static async cleanAttachments(job) {
    const { attachment } = job.data;
    await Promise.all([
      Attachment.destroy({
        where: {
          id: attachment.id,
        },
      }),
      Uploader.remove(attachment.path),
    ]);
    return Promise.resolve(`Remove ${attachment.name}`);
  }
}
