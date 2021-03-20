import Queue from 'bull';
import { redisConfig } from '../config';

export const attachmentQueue = new Queue('Attachment Queue', {
  redis: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});
