import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class ChatUser extends BaseModel {
  static get searchFields() {
    return ['friendlyName'];
  }
}

ChatUser.init(
  {
    userSid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    friendlyName: {
      type: Sequelize.STRING,
    },
    roleSid: {
      type: Sequelize.STRING,
    },
    serviceSid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    identity: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defautValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defautValue: Sequelize.NOW,
    },
    deletedAt: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    paranoid: true,
    modelName: 'chat_users',
    table: 'chat_users',
  }
);

ChatUser.baseAttibutes = ['id', 'friendlyName'];
ChatUser.beforeCreate((user) => {
  user.id = uuidv4();
});

ChatUser.findUserFree = async (channelId) => {
  const chatUsers = await sequelize.query(
    'SELECT chat_users.* FROM chat_users left join chat_members on chat_users.identity = chat_members.identity ' +
      'where chat_users.deleted_at IS NULL and chat_members.channel_id <> :channelId limit 1',
    {
      replacements: { channelId },
      type: Sequelize.QueryTypes.SELECT,
    }
  );
  const chatUser = chatUsers.pop();
  if (chatUser) {
    return new ChatUser({
      id: chatUser.id,
      identity: chatUser.identity,
      roleSid: chatUser.role_sid,
      serviceSid: chatUser.service_sid,
    });
  }

  return null;
};
module.exports = ChatUser;
