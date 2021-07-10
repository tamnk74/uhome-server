import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import ReceiveIssue from './receiveIssue';
import User from './user';

class ReceiveIssueComment extends BaseModel {}

ReceiveIssueComment.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    receiveIssueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    content: {
      type: Sequelize.STRING,
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
    modelName: 'receive_issue_comments',
    table: 'receive_issue_comments',
  }
);

ReceiveIssueComment.belongsTo(ReceiveIssue);
ReceiveIssue.hasMany(ReceiveIssueComment);
ReceiveIssueComment.belongsTo(User);

ReceiveIssueComment.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = ReceiveIssueComment;
