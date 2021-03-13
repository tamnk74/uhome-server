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
}
