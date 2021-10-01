import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import Event from './event';

class EventLocation extends BaseModel {}

EventLocation.init(
  {
    eventId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    zipCode: {
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
    modelName: 'EventLocation',
    table: 'event_locations',
  }
);

EventLocation.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

EventLocation.belongsTo(Event);

module.exports = EventLocation;
