import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class FeeCategory extends BaseModel {}

FeeCategory.init(
  {
    categoryId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    min: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    max: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    normalCost: {
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
    modelName: 'FeeCategory',
    table: 'fee_categories',
  }
);

FeeCategory.beforeCreate((instance) => {
  instance.id = uuid.v4();
});
FeeCategory.baseAttributes = ['id', 'min', 'max'];

module.exports = FeeCategory;
