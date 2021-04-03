import { fileSystemConfig } from '../config';
import MinioUpload from './Minio';
import LocalUpload from './LocalStore';
import S3 from './S3';

export default class Uploader {
  static uploader = null;

  static getInstance() {
    if (this.uploader) {
      return this.uploader;
    }
    switch (fileSystemConfig.driver) {
      case 'minio':
        this.uploader = new MinioUpload(fileSystemConfig.driver);
        this.uploader.makeBucket();
        break;
      case 'local':
        this.uploader = new LocalUpload(fileSystemConfig.driver);
        break;
      case 's3':
        this.uploader = new S3(fileSystemConfig.driver);
        break;
      default:
        break;
    }

    return this.uploader;
  }

  static async upload(file, option) {
    const instance = this.getInstance();
    return instance.upload(file, option);
  }

  static async remove(path) {
    const instance = this.getInstance();
    return instance.remove(path);
  }

  static async preSignedUrl(path, ttl = 3600) {
    const url = await this.uploader.preSignedUrl(path, ttl);
    return url;
  }

  static async getObject(path) {
    const url = await this.uploader.getObject(path);
    return url;
  }
}
