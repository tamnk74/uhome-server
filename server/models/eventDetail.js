import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class EventDetail extends BaseModel {}

EventDetail.init(
  {
    eventId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    value: {
      type: Sequelize.DECIMAL(10, 2),
    },
    maxValue: {
      type: Sequelize.DECIMAL(10, 2),
    },
    gift: {
      type: Sequelize.STRING(255),
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
    modelName: 'EventDetail',
    table: 'event_details',
  }
);

EventDetail.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

EventDetail.baseAttibutes = ['id', 'value', 'maxValue', 'gift'];

module.exports = EventDetail;