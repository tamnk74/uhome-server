import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { issueStatus } from '@/constants';
import BaseModel from './model';
import sequelize from '../databases/database';

class LatestIssueStatus extends BaseModel {}

LatestIssueStatus.init(
  {
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    issueId: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: issueStatus.OPEN,
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
    modelName: 'latest_issue_statuses',
    table: 'latest_issue_statuses',
  }
);

LatestIssueStatus.beforeCreate((instance) => {
  instance.id = uuidv4();
});

module.exports = LatestIssueStatus;
