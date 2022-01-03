import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import Event from './event';

class EventScope extends BaseModel {}

EventScope.init(
  {
    eventId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    scope: {
      type: Sequelize.STRING, // role, userId, public
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
    modelName: 'EventScope',
    table: 'event_scopes',
  }
);

EventScope.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

EventScope.belongsTo(Event);
Event.hasMany(EventScope);

module.exports = EventScope;
