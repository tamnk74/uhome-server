import Path from 'path';

require('dotenv').config();

export const fileSystemConfig = {
  driver: process.env.FILESYSTEM_DRIVER || '',
  clout_front: process.env.CLOUD_FRONT_URL || '',
  minio: {
    host: process.env.MINIO_HOST || '',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    key: process.env.MINIO_ACCESS_KEY_ID || '',
    secret: process.env.MINIO_SECRET_ACCESS_KEY || '',
    region_name: process.env.MINIO_REGION_NAME || '',
    bucket_name: process.env.MINIO_BUCKET_NAME || '',
  },
  local: {
    root: process.env.LOCAL_STORAGE_PATH || Path.resolve(__dirname, '..', 'public'),
  },
  s3: {
    key: process.env.AWS_ACCESS_KEY_ID || '',
    secret: process.env.AWS_SECRET_ACCESS_KEY || '',
    region_name: process.env.AWS_REGION_NAME || '',
    bucket_name: process.env.AWS_S3_BUCKET_NAME || '',
  },
};
