import { appUsername, appPassword } from '../config';
import errorFactory from '../errors/ErrorFactory';

export default (req, res, next) => {
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    return next(errorFactory.getError('ERR-0401'));
  }

  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === appUsername && password === appPassword) {
    return next();
  }

  return next(errorFactory.getError('ERR-0401'));
};
