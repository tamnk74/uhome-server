import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class EventCategory extends BaseModel {}

EventCategory.init(
  {
    eventId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    categoryId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    underscored: true,
    modelName: 'EventCategory',
    table: 'event_categories',
  }
);

EventCategory.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = EventCategory;
