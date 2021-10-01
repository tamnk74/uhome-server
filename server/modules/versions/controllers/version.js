import VersionService from '../services/version';

export default class VersionController {
  static async getVersion(req, res, next) {
    try {
      const result = await VersionService.getVersion(req.params.type);

      return res.status(200).json(result && result.getResponse());
    } catch (e) {
      return next(e);
    }
  }
}
