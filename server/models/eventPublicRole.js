import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import Event from './event';

class EventPublicRole extends BaseModel {}

EventPublicRole.init(
  {
    eventId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
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
    modelName: 'EventPublicRole',
    table: 'event_public_roles',
  }
);

EventPublicRole.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

EventPublicRole.belongsTo(Event);

module.exports = EventPublicRole;
