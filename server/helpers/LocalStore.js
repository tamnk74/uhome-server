import fs from 'fs';
import { fileSystemConfig } from '../config';

export default class LocalUpload {
  static driver = 'local';

  constructor(driver) {
    this.driver = driver;
  }

  async upload(file, metaData) {
    const filePath = metaData.path || file.originalname;
    const path = `${fileSystemConfig[this.driver].root}/${filePath}`;

    return fs.writeFileSync(path, file.buffer);
  }

  async remove(path) {
    const fullPath = `${fileSystemConfig[this.driver].root}/${path}`;

    return new Promise((resolve, reject) =>
      fs.unlink(fullPath, (err) => (err ? reject(err) : resolve()))
    );
  }
}
