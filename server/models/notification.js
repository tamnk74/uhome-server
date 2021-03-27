import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class Notification extends BaseModel {}

Notification.init(
  {
    actorId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    recipientId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    issueId: {
      type: Sequelize.DataTypes.UUID,
    },
    title: {
      type: Sequelize.STRING(255),
    },
    body: {
      type: Sequelize.TEXT,
    },
    status: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    createdAt: {
      defaultValue: Sequelize.NOW,
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: 'notifications',
    table: 'notifications',
  }
);

Notification.beforeCreate((notification) => {
  notification.id = uuid.v4();
});

module.exports = Notification;
