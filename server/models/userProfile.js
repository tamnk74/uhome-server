import Sequelize from 'sequelize';
import uuid from 'uuid';
import sequelize from '../databases/database';
import BaseModel from './model';

class UserProfile extends BaseModel {
  static GENDER_MALE = 0;

  static GENDER_FEMALE = 1;
}

UserProfile.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    reliability: {
      type: Sequelize.DataTypes.DECIMAL(12),
      defaultValue: 0,
    },
    totalRating: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalIssueCompleted: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0,
    },
    identityCard: {
      type: Sequelize.DataTypes.TEXT,
    },
    email: {
      type: Sequelize.DataTypes.STRING(127),
    },
    certificate: {
      type: Sequelize.DataTypes.TEXT,
    },
    yearExperience: {
      type: Sequelize.DataTypes.INTEGER,
    },
    accountBalance: {
      type: Sequelize.DataTypes.DECIMAL(12),
      defaultValue: 0,
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
    modelName: 'UserProfiles',
    table: 'UserProfiles',
  }
);

UserProfile.beforeCreate(async function beforeCreate(UserProfile) {
  UserProfile.id = uuid.v4();

  return UserProfile;
});

UserProfile.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  return values;
};

module.exports = UserProfile;
