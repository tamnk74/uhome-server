import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import Payment from './payment';
import User from './user';

class Transaction extends BaseModel {}

Transaction.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM('INBOUND', 'OUTBOUND'),
      allowNull: false,
      defaultValue: 'INBOUND',
    },
    method: {
      type: Sequelize.ENUM('system', 'momo'),
      allowNull: false,
      defaultValue: 'system',
    },
    transid: {
      type: Sequelize.DataTypes.STRING(36),
      unique: true,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fee: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: Sequelize.ENUM('VND', 'USD'),
      allowNull: false,
      defaultValue: 'VND',
    },
    extra: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
      defaultValue: '{}',
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
    modelName: 'transactions',
    table: 'transactions',
  }
);

Transaction.belongsTo(Payment);
Payment.hasMany(Transaction);
Transaction.belongsTo(User);

Transaction.beforeCreate((instant) => {
  instant.id = uuid.v4();
});

module.exports = Transaction;
