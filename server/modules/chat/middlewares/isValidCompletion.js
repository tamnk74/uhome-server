import _ from 'lodash';
import errorFactory from '../../../errors/ErrorFactory';
import { issueStatus } from '../../../constants';

export const isValidCompletion = async (req, res, next) => {
  const status = _.get(req, 'chatChannel.issue.status');

  if (status !== issueStatus.WAITING_PAYMENT) {
    return next(errorFactory.getError('CHAT-0203'));
  }

  return next();
};
