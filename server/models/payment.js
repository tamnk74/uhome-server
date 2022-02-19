import Sequelize from 'sequelize';
import uuid from 'uuid';
import { currencies } from 'constants';
import BaseModel from './model';
import sequelize from '../databases/database';
import ReceiveIssue from './receiveIssue';
import Issue from './issue';
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
      defaultValue: 'VND',
    },
    status: {
      type: Sequelize.ENUM('OPEN', 'PAID'),
      allowNull: false,
      defaultValue: 'OPEN',
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
    modelName: 'payments',
    table: 'payments',
  }
);

Payment.beforeCreate((payment) => {
  payment.id = uuid.v4();
  payment.currency = payment.currency || currencies.VND;
});

Payment.belongsTo(ReceiveIssue);
Payment.belongsTo(Issue);
ReceiveIssue.hasOne(Payment);
Issue.hasOne(Payment);
Payment.belongsTo(User);

module.exports = Payment;
