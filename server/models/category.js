import Sequelize from 'sequelize';
import uuid from 'uuid';
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
    code: {
      type: Sequelize.STRING,
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

Category.baseAttributes = ['id', 'name', 'description', 'thumbnail'];

Category.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = Category;
