import AWS from 'aws-sdk';
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
}
