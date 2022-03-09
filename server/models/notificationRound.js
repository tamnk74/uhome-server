import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../databases/database';
import BaseModel from './model';

class NotificationRound extends BaseModel {}

NotificationRound.init(
  {
    channelId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    round: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
    createdAt: {
      defaultValue: Sequelize.NOW,
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    deletedAt: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
    table: 'notification_rounds',
  }
);

NotificationRound.beforeCreate((instance) => {
  instance.id = uuidv4();
});

module.exports = NotificationRound;
