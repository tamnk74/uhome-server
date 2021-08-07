import Sequelize from 'sequelize';
import { get } from 'lodash';
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
      allowNull: true,
    },
    type: {
      type: Sequelize.ENUM('DEPOSIT', 'WITHDRAW', 'WAGE', 'PAY'),
    },
    method: {
      type: Sequelize.ENUM('system', 'momo'),
      allowNull: false,
      defaultValue: 'system',
    },
    currency: {
      type: Sequelize.ENUM('VND', 'USD'),
      allowNull: false,
      defautValue: 'VND',
    },
    extra: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
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

TransactionHistory.tranformResponseData = (transactions = []) => {
  const result = transactions.map((item) => {
    item = item.toJSON();
    const { issue } = item;
    if (issue) {
      const categories = get(issue, 'categories', []);
      const categoriesTran = categories.map((cat) => {
        delete cat.category_issues;
        return cat;
      });
      issue.categories = categoriesTran;
    }

    item.issue = issue;

    return item;
  });

  return result;
};
module.exports = TransactionHistory;