import Sequelize from 'sequelize';
import Bcrypt from 'bcryptjs';
import BaseModel from './model';
import sequelize from '../databases/database';

class User extends BaseModel {
  static ACTIVE_STATUS = 'ACTIVE';

  static INACTIVE_STATUS = 'INACTIVE';
}

User.init(
  {
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    birthday: {
      type: Sequelize.DATE,
    },
    address: {
      type: Sequelize.STRING,
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'default.png',
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    longitude: {
      type: Sequelize.DataTypes.FLOAT,
    },
    latitude: {
      type: Sequelize.DataTypes.FLOAT,
    },
    role: {
      type: Sequelize.ENUM('USER', 'ADMIN'),
      allowNull: true,
      defaultValue: 'USER',
    },
    status: {
      type: Sequelize.ENUM(0, 1),
      allowNull: true,
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
    modelName: 'users',
    table: 'users',
  }
);

User.prototype.toPayload = function toPayload() {
  return {
    id: this.dataValues.id,
    phoneNumber: this.dataValues.phoneNumber,
    name: this.dataValues.name,
  };
};

User.generateHash = async function generateHash(password) {
  return Bcrypt.hash(password, 8);
};

User.prototype.comparePassword = async function comparePassword(password) {
  return Bcrypt.compare(password, this.dataValues.password);
};

User.beforeCreate(async function beforeCreate(user) {
  if (user.changed('password')) {
    user.password = await User.generateHash(user.password);
  }
  return user;
});

User.beforeBulkUpdate(async function beforeBulkUpdate(options) {
  options.attributes.password =
    options.attributes.password && (await User.generateHash(options.attributes.password));
});

module.exports = User;
