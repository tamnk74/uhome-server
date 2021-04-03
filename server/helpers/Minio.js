import { Client } from 'minio';
import { fileSystemConfig } from '../config';

export default class MinioUpload {
  static minioClient = null;

  static driver = 'minio';

  constructor(driver) {
    this.driver = driver;

    if (this.minioClient) {
      return this.minioClient;
    }

    this.minioClient = new Client({
      endPoint: fileSystemConfig[driver].host,
      port: fileSystemConfig[driver].port,
      useSSL: false,
      accessKey: fileSystemConfig[driver].key,
      secretKey: fileSystemConfig[driver].secret,
    });
  }

  async makeBucket() {
    return this.minioClient.makeBucket(
      fileSystemConfig[this.driver].bucket_name,
      fileSystemConfig[this.driver].region_name
    );
  }

  async upload(file, metaData) {
    return this.minioClient.putObject(
      fileSystemConfig[this.driver].bucket_name,
      metaData.path,
      file.buffer,
      file.size,
      metaData
    );
  }

  async remove(path) {
    return this.minioClient.removeObject(fileSystemConfig[this.driver].bucket_name, path);
  }

  async preSignedUrl(path, ttl) {
    return this.minioClient.presignedUrl(
      'GET',
      fileSystemConfig[this.driver].bucket_name,
      path,
      ttl
    );
  }

  async getObject(path) {
    return this.minioClient.getObject(fileSystemConfig[this.driver].bucket_name, path);
  }
}
