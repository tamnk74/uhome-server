import Version from '../../../models/version';

export default class VersionService {
  static async getVersion(type) {
    return Version.findOne({
      where: {
        type,
      },
    });
  }
}
