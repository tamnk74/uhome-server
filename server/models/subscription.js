import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import User from './user';

class Subscription extends BaseModel {}

Subscription.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: Sequelize.ENUM('CUSTOMER', 'WORKER'),
      allowNull: true,
      defaultValue: 'CUSTOMER',
    },
    token: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    createdAt: {
      defaultValue: Sequelize.NOW,
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: 'subscriptions',
    table: 'subscriptions',
  }
);

Subscription.beforeCreate((subscription) => {
  subscription.id = uuid.v4();
});

Subscription.belongsTo(User);

module.exports = Subscription;
