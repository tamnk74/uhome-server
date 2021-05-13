import Sequelize from 'sequelize';
import BaseModel from './model';
import sequelize from '../databases/database';

class CancelSupportIssue extends BaseModel {}

CancelSupportIssue.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    receiveIssueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: Sequelize.STRING(2048),
      allowNull: false,
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
    modelName: 'cancel_support_issues',
    table: 'cancel_support_issues',
  }
);

module.exports = CancelSupportIssue;
