import Sequelize from 'sequelize';
import BaseModel from './model';
import sequelize from '../databases/database';
import Category from './category';
import User from './user';

class Post extends BaseModel {
  static get sortKeys() {
    return ['createdAt', 'view'];
  }

  static get searchFields() {
    return ['title'];
  }

  static get mapFilterFields() {
    return {
      user_id: 'userId',
      category_id: 'categoryId',
    };
  }

  static getModels() {
    return [
      {
        model: Category,
        required: false,
      },
      {
        model: User,
        required: false,
      },
    ];
  }
}

Post.init(
  {
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    view: {
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.UUID,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    categoryId: {
      type: Sequelize.UUID,
      references: { model: 'Categories', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
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
    modelName: 'posts',
    table: 'posts',
  }
);

Post.belongsTo(Category);
Post.belongsTo(User);

module.exports = Post;
