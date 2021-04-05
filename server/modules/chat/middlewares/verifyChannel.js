import ChatChannel from '../../../models/chatChannel';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyChannel = async (req, res, next) => {
  try {
    const chatChannel = await ChatChannel.findByPk(req.params.channelId);

    if (!chatChannel) {
      throw errorFactory.getError('CHAT-0001');
    }

    req.chatChannel = chatChannel;
    return next();
  } catch (e) {
    return next(e);
  }
};
