import Sequelize from 'sequelize';
import BaseModel from './model';
import sequelize from '../databases/database';

class Category extends BaseModel {}

Category.init(
  {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT('tiny'),
    },
    image: {
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
    modelName: 'categories',
    table: 'categories',
  }
);

module.exports = Category;
