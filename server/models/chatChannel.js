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
ChatChannel.addChannel = (data) => {
  return sequelize.transaction(async (t) => {
    const channel = await ChatChannel.create(data, {
      transaction: t,
    });
    return channel;
  });
};

ChatChannel.findChannelGroup = async (issueId, userIds = []) => {
  let sql = 'select chat_channels.* from chat_channels inner join';
  sql +=
    ' (select chat_channels.id, count(channel_id) as members from chat_channels inner join chat_members on chat_channels.id = chat_members.channel_id';
  sql +=
    ' where chat_channels.issue_id = :issueId and chat_members.user_id in (:userIds) group by channel_id) as tmp ';
  sql += ' on chat_channels.id = tmp.id where tmp.members = :number';
  const result = await sequelize.query(sql, {
    replacements: { issueId, userIds, number: userIds.length },
    type: Sequelize.QueryTypes.SELECT,
  });

  const channel = first(result);
  if (channel) {
    return new ChatChannel({
      id: channel.id,
      issueId: channel.issue_id,
      channelSid: channel.channel_sid,
      friendlyName: channel.friendly_name,
      serviceSid: channel.service_sid,
    });
  }

  return null;
};
module.exports = ChatChannel;
