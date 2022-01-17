import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class Holiday extends BaseModel {}

Holiday.init(
  {
    from: {
      type: Sequelize.DATE,
    },
    to: {
      type: Sequelize.DATE,
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
    modelName: 'Holiday',
    table: 'holidays',
  }
);

Holiday.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

Holiday.baseAttributes = ['id', 'from', 'to'];

module.exports = Holiday;
