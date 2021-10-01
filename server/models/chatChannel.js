import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { first } from 'lodash';
import BaseModel from './model';
import sequelize from '../databases/database';
import Issue from './issue';

class ChatChannel extends BaseModel {
  static get searchFields() {
    return ['friendlyName'];
  }
}

ChatChannel.init(
  {
    issueId: {
      allowNull: false,
      type: Sequelize.DataTypes.UUID,
    },
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
ChatChannel.belongsTo(Issue);

ChatChannel.beforeCreate((channel) => {
  channel.id = uuidv4();
});
ChatChannel.addChannel = async (data) => {
  return sequelize.transaction(async (t) => {
    const channel = await ChatChannel.create(data, {
      transaction: t,
    });
    return channel;
  });
};

const getChannelIdsByIssueAndUserId = async (issueId, userId) => {
  let sql = 'select chat_channels.id from chat_channels inner join';
  sql += ' chat_members on chat_channels.id = chat_members.channel_id';
  sql += ' where chat_channels.issue_id = :issueId and chat_members.user_id = :userId';

  const result = await sequelize.query(sql, {
    replacements: { issueId, userId },
    type: Sequelize.QueryTypes.SELECT,
  });

  return result.map((item) => item.id);
};

ChatChannel.findChannelGroup = async (issueId, userIds = []) => {
  const promises = userIds.map((userId) => getChannelIdsByIssueAndUserId(issueId, userId));
  const channels = await Promise.all(promises);

  const result = channels.reduce((a, b) => a.filter((c) => b.includes(c)));
  const channelId = first(result);

  return ChatChannel.findByPk(channelId);
};

module.exports = ChatChannel;
