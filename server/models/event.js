import Sequelize, { Op } from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import Category from './category';
import EventCategory from './eventCategory';
import sequelize from '../databases/database';
import { fileSystemConfig } from '../config';
import { saleEventTypes, eventStatuses } from '../constants';

class Event extends BaseModel {}

Event.init(
  {
    type: {
      type: Sequelize.ENUM(...Object.values(saleEventTypes)),
      allowNull: false,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
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
    value: {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 1000000000,
    },
    maxValue: {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 1000000000,
    },
    minValue: {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
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

Event.belongsToMany(Category, { as: 'categories', through: EventCategory });

Event.baseAttibutes = [
  'id',
  'type',
  'title',
  'description',
  'image',
  'minValue',
  'maxValue',
  'status',
  'from',
  'to',
];
Event.buildRelation = () => {
  return [
    {
      model: Category,
      as: 'categories',
    },
  ];
};

Event.whereCondition = (user) => {
  console.log(user);
  const filteredEventSql = sequelize.dialect.QueryGenerator.selectQuery('event_scope', {
    attributes: ['event_id'],
    where: {
      scope: {
        [Op.or]: [user.sessionRole, 'public'],
      },
    },
  }).slice(0, -1);
  return {
    from: {
      [Op.lte]: new Date(),
    },
    to: {
      [Op.gte]: new Date(),
    },
    id: {
      [Op.in]: Sequelize.literal(`(${filteredEventSql})`),
    },
    status: eventStatuses.ACTIVE,
  };
};

module.exports = Event;
