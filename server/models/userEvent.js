import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class UserEvent extends BaseModel {}

UserEvent.init(
  {
    eventId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    issueId: {
      type: Sequelize.UUID,
      allowNull: true,
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
    modelName: 'UserEvent',
    table: 'user_events',
  }
);

UserEvent.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = UserEvent;
