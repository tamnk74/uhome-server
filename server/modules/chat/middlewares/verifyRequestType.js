import errorFactory from '../../../errors/ErrorFactory';
import { commandRequests } from '../../../constants';

export const verifyRequestType = async (req, res, next) => {
  const { type } = req.params;

  if (!commandRequests.includes(type)) {
    return next(errorFactory.getError('CHAT-0103'));
  }

  return next();
};
