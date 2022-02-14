import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import ChatChannel from './chatChannel';

class ChatMember extends BaseModel {
  static get searchFields() {
    return ['friendlyName'];
  }
}

ChatMember.init(
  {
    channelId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    channelSid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    memberSid: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    identity: {
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
    roleSid: {
      type: Sequelize.STRING,
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
    modelName: 'chat_members',
    table: 'chat_members',
  }
);

ChatMember.baseAttributes = ['id', 'friendlyName'];
ChatMember.belongsTo(ChatChannel, { foreignKey: 'channelId', as: 'chatChannel' });

ChatMember.beforeCreate((member) => {
  member.id = uuidv4();
});
ChatMember.addMember = (data) => {
  return sequelize.transaction(async (t) => {
    const chatMember = await ChatMember.create(data, {
      transaction: t,
    });
    return chatMember;
  });
};

ChatMember.findMember = (userId, channelId) => {
  return ChatMember.findOne({
    where: {
      userId,
      channelId,
    },
    include: [
      {
        model: ChatChannel,
        required: true,
        as: 'chatChannel',
      },
    ],
  });
};

ChatMember.getSupporterIds = async (channelId) => {
  const members = await ChatMember.findAll({
    where: {
      channelId,
    },
  });

  return members.map((item) => item.userId);
};

module.exports = ChatMember;
