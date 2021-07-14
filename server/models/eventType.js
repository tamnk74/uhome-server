import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class EventType extends BaseModel {}

EventType.init(
  {
    name: {
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
    modelName: 'EventType',
    table: 'event_types',
  }
);

EventType.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = EventType;
