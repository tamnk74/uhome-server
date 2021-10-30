import Sequelize from 'sequelize';
import uuid from 'uuid';
import { isNil } from 'lodash';

import BaseModel from './model';
import sequelize from '../databases/database';
import { issueStatus } from '../constants';
import User from './user';
import Issue from './issue';

class ReceiveIssue extends BaseModel {
  static get mapFilterFields() {
    return {
      status: 'status',
    };
  }
}

ReceiveIssue.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    issueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    time: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    numOfWorker: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    workerFee: {
      type: Sequelize.DECIMAL(10, 2),
    },
    customerFee: {
      type: Sequelize.DECIMAL(10, 2),
    },
    discount: {
      type: Sequelize.DECIMAL(10, 2),
    },
    rating: {
      type: Sequelize.DECIMAL(2),
      defaultValue: 0,
    },
    startTime: {
      type: Sequelize.DATE,
    },
    endTime: {
      type: Sequelize.DATE,
    },
    reason: {
      type: Sequelize.STRING(2048),
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
    modelName: 'receive_issues',
    table: 'receive_issues',
  }
);
ReceiveIssue.beforeCreate((instant) => {
  instant.id = uuid.v4();
});
ReceiveIssue.belongsTo(User);
User.hasMany(ReceiveIssue);

ReceiveIssue.belongsTo(Issue);
Issue.hasOne(ReceiveIssue, { as: 'supporting', foreignKey: 'issueId' });

ReceiveIssue.cancel = ({ receiveIssue, reason }) => {
  return sequelize.transaction(async (t) => {
    const options = {
      transaction: t,
    };
    await Promise.all([
      ReceiveIssue.update(
        {
          status: issueStatus.CANCELLED,
          reason,
        },
        {
          where: {
            id: receiveIssue.id,
          },
        },
        options
      ),
      Issue.update(
        {
          status: issueStatus.OPEN,
        },
        {
          where: {
            id: receiveIssue.issueId,
          },
        },
        options
      ),
    ]);

    return receiveIssue;
  });
};

ReceiveIssue.findByIssueIdAndUserIdsAndCheckHasEstimation = async (issueId, supporterIds = []) => {
  const receiveIssue = await ReceiveIssue.findOne({
    where: {
      issueId,
      userId: supporterIds,
    },
  });

  if (isNil(receiveIssue) || isNil(receiveIssue.startTime) || isNil(receiveIssue.endTime)) {
    throw new Error('ISSUE-0412');
  }

  return receiveIssue;
};

module.exports = ReceiveIssue;
