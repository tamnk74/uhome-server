import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class ChatChannel extends BaseModel {
  static get searchFields() {
    return ['friendlyName'];
  }
}

ChatChannel.init(
  {
    channelSid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    friendlyName: {
      type: Sequelize.STRING,
    },
    serviceSid: {
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
    modelName: 'chat_channels',
    table: 'chat_channels',
  }
);

ChatChannel.baseAttibutes = ['id', 'friendlyName'];
ChatChannel.beforeCreate((channel) => {
  channel.id = uuidv4();
});
ChatChannel.addChannel = (data) => {
  return sequelize.transaction(async (t) => {
    const channel = await ChatChannel.create(data, {
      transaction: t,
    });
    return channel;
  });
};

module.exports = ChatChannel;
