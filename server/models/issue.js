import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import Category from './category';
import CategoryIssue from './categoryIssue';
import Attachment from './attachment';
import sequelize from '../databases/database';
import { issueStatus } from '../constants';
import RequestSupporting from './requestSupporting';
import User from './user';

class Issue extends BaseModel {
  static get searchFields() {
    return ['title'];
  }

  static get mapFilterFields() {
    return {
      created_by: 'createdBy',
      title: 'title',
      location: 'location',
      status: 'status',
    };
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
    status: {
      type: Sequelize.ENUM(Object.values(issueStatus)),
      defaultValue: issueStatus.OPEN,
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
Issue.hasMany(Attachment, { as: 'attachments' });
RequestSupporting.belongsTo(Issue);
RequestSupporting.belongsTo(User);

Issue.hasMany(RequestSupporting, { as: 'requestSupportings' });
Issue.belongsToMany(User, { as: 'requestUsers', through: RequestSupporting });

Issue.beforeCreate((issue) => {
  issue.id = uuid.v4();
});

Issue.addIssue = (data) => {
  return sequelize.transaction(async (t) => {
    const issue = await Issue.create(data, {
      transaction: t,
    });

    await Promise.all([
      issue.addCategories(data.categoryIds, {
        transaction: t,
      }),
      issue.addAttachments(data.attachmentIds, {
        transaction: t,
      }),
    ]);

    return issue;
  });
};

Issue.removeIssue = (issue) => {
  return sequelize.transaction(async (t) => {
    return Promise.all([
      Attachment.destroy({
        where: {
          issueId: issue.id,
        },
        transaction: t,
      }),
      issue.destroy({
        transaction: t,
      }),
    ]);
  });
};

Issue.buildRelation = (categoryIds = []) => {
  let filterCategories = {};
  if (categoryIds.length) {
    filterCategories = {
      id: categoryIds,
    };
  }
  return [
    {
      model: Category,
      required: true,
      as: 'categories',
      where: {
        ...filterCategories,
      },
    },
    {
      model: Attachment,
      as: 'attachments',
      require: false,
      attributes: [
        'id',
        'size',
        'mimeType',
        'createdAt',
        'updatedAt',
        'issueId',
        'path',
        Attachment.buildUrlAttribuiteSelect(),
      ],
    },
  ];
};
module.exports = Issue;
