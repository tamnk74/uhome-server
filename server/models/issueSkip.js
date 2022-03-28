import Sequelize from 'sequelize';
import BaseModel from './model';
import sequelize from '../databases/database';
import Issue from './issue';

class IssueSkip extends BaseModel {}

IssueSkip.init(
  {
    issueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
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
    modelName: 'issueSkip',
    table: 'issue_skips',
  }
);

IssueSkip.belongsTo(Issue);

module.exports = IssueSkip;
