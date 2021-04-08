import Sequelize from 'sequelize';
import BaseModel from './model';
import sequelize from '../databases/database';
import { issueStatus } from '../constants';
import User from './user';
import Issue from './issue';

class ReceiveIssue extends BaseModel {}

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
      allowNull: false,
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

ReceiveIssue.belongsTo(User);
User.hasMany(ReceiveIssue);

ReceiveIssue.belongsTo(Issue);

module.exports = ReceiveIssue;
