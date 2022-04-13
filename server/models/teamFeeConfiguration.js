import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class TeamFeeConfiguration extends BaseModel {}

TeamFeeConfiguration.init(
  {
    categoryId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    minWorker: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    fee: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    provinceCode: {
      type: Sequelize.STRING,
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
    modelName: 'TeamFeeConfiguration',
    table: 'team_fee_configurations',
  }
);

TeamFeeConfiguration.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = TeamFeeConfiguration;
