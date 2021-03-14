import { v4 as uuidv4 } from 'uuid';
import Attachment from '../../../models/attachment';
import Uploader from '../../../helpers/Uploader';

export default class AttachmentService {
  static get filePath() {
    return 'attachments';
  }

  static async upload(req) {
    const { files } = req;
    return Promise.all(
      files.map(async (file) => {
        const id = uuidv4();
        const fileName = `${id}-${file.originalname}`;
        const [attachment] = await Promise.all([
          Attachment.create({
            id,
            name: file.originalname,
            path: `${this.filePath}/${fileName}`,
            mimeType: file.mimetype,
            size: file.size,
          }),
          Uploader.upload(file, {
            path: `${this.filePath}/${fileName}`,
            'x-amz-meta-mimeType': file.mimetype,
            'x-amz-meta-size': file.size.toString(),
          }),
        ]);
        return attachment;
      })
    );
  }
}
