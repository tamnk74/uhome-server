import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import { issueStatus } from '../constants';
import User from './user';
import Issue from './issue';
import CancelSupportIssue from './cancelSupportIssue';

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
    cost: {
      type: Sequelize.INTEGER,
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
CancelSupportIssue.belongsTo(ReceiveIssue);
ReceiveIssue.hasMany(CancelSupportIssue);

ReceiveIssue.cancel = ({ receiveIssue, reason, userId }) => {
  return sequelize.transaction(async (t) => {
    const options = {
      transaction: t,
    };
    await Promise.all([
      ReceiveIssue.update(
        {
          status: issueStatus.CANCELLED,
        },
        {
          where: {
            id: receiveIssue.id,
          },
        },
        options
      ),
      CancelSupportIssue.create(
        {
          userId,
          reason,
          receiveIssueId: receiveIssue.id,
        },
        options
      ),
    ]);

    return receiveIssue;
  });
};
module.exports = ReceiveIssue;
