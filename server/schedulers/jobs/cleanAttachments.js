import schedule from 'node-schedule';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import Attachment from '../../models/attachment';
import AttachmentService from '../service/attachment';
import { attachmentQueue } from '../../helpers/Queue';

// will run every day at 12:00 AM 0 0 * * *
schedule.scheduleJob('0 0 * * *', async () => {
  const yesterday = dayjs().subtract(1, 'day');
  const attachments = await Attachment.findAll({
    where: {
      issueId: null,
      updated_at: {
        [Op.lt]: yesterday,
      },
    },
    limit: 1,
  });
  attachments.forEach((attachment) => attachmentQueue.add({ attachment }));
});

attachmentQueue.process(AttachmentService.cleanAttachments);
