import Sequelize from 'sequelize';
import BaseModel from './model';
import sequelize from '../databases/database';

class Category extends BaseModel {
  static get searchFields() {
    return ['name'];
  }
}

Category.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      defautValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defautValue: Sequelize.NOW,
    },
    deletedAt: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    paranoid: true,
    modelName: 'categories',
    table: 'categories',
  }
);

Category.baseAttibutes = ['id', 'name', 'description', 'thumbnail'];

module.exports = Category;
