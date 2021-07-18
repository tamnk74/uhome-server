import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import Payment from './payment';
import User from './user';

class Transaction extends BaseModel {}

Transaction.init(
  {
    paymentId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM('INBOUND', 'OUTBOUND'),
      allowNull: false,
      defautValue: 'INBOUND',
    },
    method: {
      type: Sequelize.ENUM('system', 'momo'),
      allowNull: false,
      defautValue: 'system',
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
      defautValue: 0,
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
