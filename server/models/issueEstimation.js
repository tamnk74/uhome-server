import Sequelize from 'sequelize';
import uuid from 'uuid';

import BaseModel from './model';
import sequelize from '../databases/database';
import { issueType, unitTime } from '../constants';

class IssueEstimation extends BaseModel {
  static get mapFilterFields() {
    return {
      status: 'status',
    };
  }
}

IssueEstimation.init(
  {
    receiveIssueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    totalTime: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    unitTime: {
      type: Sequelize.ENUM(Object.values(unitTime)),
      defaultValue: unitTime.HOUR,
    },
    numOfWorker: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    workerFee: {
      type: Sequelize.DECIMAL(10, 2),
    },
    discount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    customerFee: {
      type: Sequelize.DECIMAL(10, 2),
    },
    type: {
      type: Sequelize.ENUM(Object.values(issueType)),
      defaultValue: issueType.HOTFIX,
    },
    workingTimes: {
      type: Sequelize.JSON,
      defaultValue: '[]',
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
    modelName: 'issue_estimations',
    table: 'issue_estimations',
  }
);
IssueEstimation.beforeCreate((instant) => {
  instant.id = uuid.v4();
});

module.exports = IssueEstimation;
