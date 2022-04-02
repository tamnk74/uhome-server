import Sequelize, { Op } from 'sequelize';
import uuid from 'uuid';
import _ from 'lodash';
import BaseModel from './model';
import Category from './category';
import EventCategory from './eventCategory';
import sequelize from '../databases/database';
import { fileSystemConfig } from '../config';
import { saleEventTypes, eventStatuses, calculateType, userRoles } from '../constants';

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
      defaultValue: Sequelize.NOW,
    },
    to: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    valueType: {
      type: Sequelize.ENUM(...Object.values(calculateType)),
      allowNull: false,
      defaultValue: calculateType.FIXED,
    },
    value: {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    maxValue: {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    limit: {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: -1,
    },
    minValue: {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
    allowAddCategory: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
EventCategory.belongsTo(Event);

Event.prototype.isExpired = function isExpired() {
  const now = new Date();
  return (
    this.dataValues.status !== eventStatuses.ACTIVE ||
    this.dataValues.from > now ||
    this.dataValues.to < now
  );
};

Event.prototype.getDiscountValue = function getDiscountValue(total) {
  if (this.dataValues.valueType === calculateType.FIXED) {
    return this.dataValues.value < total ? this.dataValues.value : total;
  }

  if (this.dataValues.valueType === calculateType.PERCENT) {
    const value = (total * this.dataValues.value) / 100;
    if (value > this.dataValues.maxValue) return this.dataValues.maxValue;
    if (value < this.dataValues.minValue) return this.dataValues.minValue;
    return value;
  }

  return 0;
};

Event.baseAttributes = [
  'id',
  'type',
  'code',
  'title',
  'description',
  'image',
  'value',
  'valueType',
  'minValue',
  'maxValue',
  'status',
  'from',
  'to',
  'allowAddCategory',
];
Event.buildRelation = () => {
  return [
    {
      model: Category,
      as: 'categories',
    },
  ];
};

Event.whereCondition = (user, params) => {
  const types = params.type ? params.type.split(',') : [];
  const filteredEventSql = sequelize.dialect.QueryGenerator.selectQuery('event_scopes', {
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
    ...(types.length ? { type: types } : null),
  };
};

Event.prototype.getDiscount = function getDiscount(workerCost = 0, customerCost = 0) {
  const eventScopes = _.get(this, 'EventScopes', []);
  const workerEvent = _.find(eventScopes, (o) => o.scope === userRoles.WORKER);
  const customerEvent = _.find(eventScopes, (o) => o.scope === userRoles.CUSTOMER);

  return {
    worker: _.isEmpty(workerEvent) ? 0 : Math.ceil(this.getDiscountValue(workerCost)),
    customer: _.isEmpty(customerEvent) ? 0 : Math.ceil(this.getDiscountValue(customerCost)),
  };
};

module.exports = Event;
