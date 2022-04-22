import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class TimeSlotConfiguration extends BaseModel {}

TimeSlotConfiguration.init(
  {
    categoryId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    min: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
    max: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
    province: {
      type: Sequelize.STRING,
    },
    cost: {
      type: Sequelize.DataTypes.FLOAT,
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
    modelName: 'TimeSlotConfiguration',
    table: 'time_slot_configurations',
  }
);

TimeSlotConfiguration.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

TimeSlotConfiguration.baseAttributes = ['id', 'min', 'max', 'cost', 'province'];

module.exports = TimeSlotConfiguration;
