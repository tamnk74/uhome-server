import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import User from './user';
import Issue from './issue';

class TransactionHistory extends BaseModel {}

TransactionHistory.init(
  {
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    issueId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM('DEPOSIT', 'WITHDRAW', 'WAGE', 'PAY'),
    },
    method: {
      type: Sequelize.ENUM('system', 'momo'),
      allowNull: false,
      defautValue: 'system',
    },
    currency: {
      type: Sequelize.ENUM('VND', 'USD'),
      allowNull: false,
      defautValue: 'VND',
    },
    extra: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
      defautValue: '{}',
    },
    createdAt: {
      defaultValue: Sequelize.NOW,
      type: Sequelize.DATE,
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
    modelName: 'TransactionHistory',
    table: 'transaction_histories',
  }
);

TransactionHistory.beforeCreate((instance) => {
  instance.id = uuid.v4();
});
TransactionHistory.baseAttibutes = ['id', 'amount', 'type', 'method', 'currency', 'extra'];
TransactionHistory.belongsTo(User);
TransactionHistory.belongsTo(Issue);

module.exports = TransactionHistory;
