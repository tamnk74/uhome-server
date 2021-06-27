import Sequelize from 'sequelize';
import BaseModel from './model';
import sequelize from '../databases/database';
import ReceiveIssue from './receiveIssue';
import User from './user';

class Payment extends BaseModel {}

Payment.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    receiveIssueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    issueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    total: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalCost: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.ENUM('VND', 'USD'),
      allowNull: false,
      defautValue: 'VND',
    },
    status: {
      type: Sequelize.ENUM('OPEN', 'PAID'),
      allowNull: false,
      defautValue: 'OPEN',
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
    modelName: 'payments',
    table: 'payments',
  }
);

Payment.belongsTo(ReceiveIssue);
ReceiveIssue.hasOne(Payment);
Payment.belongsTo(User);

module.exports = Payment;
