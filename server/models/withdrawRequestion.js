import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import { withdrawStatus, paymentMethod } from '../constants';
import User from './user';

class WithdrawRequestion extends BaseModel {}

WithdrawRequestion.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
    },
    status: {
      type: Sequelize.ENUM(Object.values(withdrawStatus)),
      defaultValue: withdrawStatus.OPEN,
    },
    paymentMethod: {
      type: Sequelize.ENUM(Object.values(paymentMethod)),
      defaultValue: paymentMethod.CASH,
    },
    currency: {
      type: Sequelize.ENUM('VND', 'USD'),
      defautValue: 'VND',
    },
    failReason: {
      type: Sequelize.TEXT,
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
    tableName: 'withdraw_requestion',
  }
);

WithdrawRequestion.belongsTo(User);

WithdrawRequestion.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = WithdrawRequestion;
