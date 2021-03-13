import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import Category from './category';
import CategoryIssue from './categoryIssue';
import sequelize from '../databases/database';

class Issue extends BaseModel {
  static get searchFields() {
    return ['title'];
  }
}

Issue.init(
  {
    createdBy: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    location: {
      type: Sequelize.DataTypes.STRING,
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
    modelName: 'issues',
    table: 'issues',
  }
);

Issue.belongsToMany(Category, { as: 'categories', through: CategoryIssue });
Issue.beforeCreate((issue) => {
  issue.id = uuid.v4();
});

Issue.addIssue = (data) => {
  return sequelize.transaction(async (t) => {
    const issue = await Issue.create(data, {
      transaction: t,
    });

    await issue.addCategories(data.categoryIds, {
      transaction: t,
    });

    return issue;
  });
};
module.exports = Issue;
