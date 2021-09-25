import Queue from 'bull';
import { redisConfig } from '../config';

export const attachmentQueue = new Queue('Attachment Queue', {
  redis: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});

export const notificationQueue = new Queue('Push notification', {
  redis: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});

export const verifyIdentifyCardQueue = new Queue('Verify identify card', {
  redis: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});

export const chatMessageQueue = new Queue('Update message chatting', {
  redis: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});
