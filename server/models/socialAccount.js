import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import { socialAccount } from '../constants';

class SocialAccount extends BaseModel {}

SocialAccount.init(
  {
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    socialId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM(Object.values(socialAccount)),
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
    deletedAt: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: 'social_accounts',
    table: 'social_accounts',
  }
);

SocialAccount.beforeCreate((derviceToken) => {
  derviceToken.id = uuid.v4();
});

module.exports = SocialAccount;
