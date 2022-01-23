import AWS from 'aws-sdk';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileSystemConfig } from '../config';

export default class S3 {
  static client = null;

  static driver = 's3';

  constructor(driver) {
    this.driver = driver;

    if (this.client) {
      return this.client;
    }

    AWS.config.update({
      accessKeyId: fileSystemConfig[driver].key,
      secretAccessKey: fileSystemConfig[driver].secret,
      region: fileSystemConfig[driver].region_name,
    });

    this.client = new AWS.S3();
    this.s3Client = new S3Client({ region: fileSystemConfig[driver].region_name });
  }

  async upload(file, metadata) {
    const params = {
      Bucket: fileSystemConfig[this.driver].bucket_name,
      Key: metadata.path,
      Body: file.buffer,
      Metadata: metadata,
    };

    return this.client.putObject(params).promise();
  }

  async preSignedUrl({ path, ttl }) {
    const command = new PutObjectCommand({
      Bucket: fileSystemConfig[this.driver].bucket_name,
      Key: path,
      ContentType: 'video/mp4',
      ACL: 'public-read',
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: ttl,
    });

    return signedUrl;
  }
}
