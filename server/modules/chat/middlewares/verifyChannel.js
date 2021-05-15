import ChatChannel from '../../../models/chatChannel';
import Issue from '../../../models/issue';
import errorFactory from '../../../errors/ErrorFactory';

export const verifyChannel = async (req, res, next) => {
  try {
    const chatChannel = await ChatChannel.findByPk(req.params.channelId, {
      include: [
        {
          model: Issue,
          require: true,
        },
      ],
    });

    if (!chatChannel) {
      throw errorFactory.getError('CHAT-0001');
    }

    req.chatChannel = chatChannel;
    return next();
  } catch (e) {
    return next(e);
  }
};
