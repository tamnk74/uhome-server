import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import Category from './category';
import CategoryIssue from './categoryIssue';
import Attachment from './attachment';
import sequelize from '../databases/database';
import { issueStatus, paymentMethod } from '../constants';
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

  fmtRes() {
    return {
      status: this.status,
      id: this.id,
      title: this.title,
      location: this.location,
      createdBy: this.createdBy,
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
    lat: {
      type: Sequelize.DataTypes.DECIMAL(9, 6),
    },
    lon: {
      type: Sequelize.DataTypes.DECIMAL(9, 6),
    },
    status: {
      type: Sequelize.ENUM(Object.values(issueStatus)),
      defaultValue: issueStatus.OPEN,
    },
    paymentMethod: {
      type: Sequelize.ENUM(Object.values(paymentMethod)),
      defaultValue: paymentMethod.CASH,
    },
    eventId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: true,
    },
    msgAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
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

Issue.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(RequestSupporting, { as: 'requestSupportings' });

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

Issue.buildRelation = (categoryIds = [], duplicating = true) => {
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
      duplicating,
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
        'thumbnail',
        'issueId',
        'path',
        'thumbnailPath',
        Attachment.buildUrlAttributeSelect(),
      ],
      duplicating,
    },
  ];
};

Issue.getIssueOption = (userId) => {
  const filteredCategorySql = sequelize.dialect.QueryGenerator.selectQuery('user_category', {
    attributes: ['category_id'],
    where: {
      user_id: userId,
    },
  }).slice(0, -1);

  const filterIssueSql = sequelize.dialect.QueryGenerator.selectQuery('category_issues', {
    attributes: ['issue_id'],
    where: {
      category_id: {
        [Sequelize.Op.in]: Sequelize.literal(`(${filteredCategorySql})`),
      },
    },
  }).slice(0, -1);

  return filterIssueSql;
};

Issue.getCancelledIssues = (userId) => {
  const filterIssueSql = sequelize.dialect.QueryGenerator.selectQuery('receive_issues', {
    attributes: ['issue_id'],
    where: {
      user_id: userId,
      status: issueStatus.CANCELLED,
    },
  }).slice(0, -1);

  return filterIssueSql;
};

Issue.getIssueSkips = (userId) => {
  const filterIssueSql = sequelize.dialect.QueryGenerator.selectQuery('issue_skips', {
    attributes: ['issue_id'],
    where: {
      user_id: userId,
    },
  }).slice(0, -1);

  return filterIssueSql;
};

module.exports = Issue;
