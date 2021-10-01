import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import EventType from './eventType';
import EventDetail from './eventDetail';
import { fileSystemConfig } from '../config';

class Event extends BaseModel {}

Event.init(
  {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    eventTypeId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    image: {
      type: Sequelize.STRING,
      get() {
        const storedValue = this.getDataValue('image');
        return `${fileSystemConfig.clout_front}/${storedValue}`;
      },
    },
    from: {
      type: Sequelize.DATE,
      defautValue: Sequelize.NOW,
    },
    to: {
      type: Sequelize.DATE,
      defautValue: Sequelize.NOW,
    },
    status: {
      type: Sequelize.TINYINT,
      defautValue: 0,
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
    modelName: 'Event',
    table: 'events',
  }
);

Event.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

Event.belongsTo(EventType);
Event.hasOne(EventDetail);

Event.baseAttibutes = ['id', 'title', 'description', 'image', 'status', 'from', 'to'];
Event.buildRelation = () => {
  return [
    {
      model: EventType,
      required: true,
      attributes: EventType.baseAttibutes,
    },
    {
      model: EventDetail,
      required: true,
      attributes: EventDetail.baseAttibutes,
    },
  ];
};

module.exports = Event;
