import Sequelize, { Op } from 'sequelize';
import Bcrypt from 'bcryptjs';
import uuid from 'uuid';
import sequelize from '../databases/database';
import BaseModel from './model';
import SocialAccount from './socialAccount';
import UserProfile from './userProfile';
import Category from './category';
import { socialAccount } from '../constants';
import { fileSystemConfig } from '../config';

class User extends BaseModel {
  static ACTIVE_STATUS = 'ACTIVE';

  static INACTIVE_STATUS = 'INACTIVE';

  static includeFacebookAccount(socialId) {
    return {
      model: SocialAccount,
      as: 'socialAccounts',
      where: {
        socialId,
        type: socialAccount.FACEBOOK,
      },
    };
  }

  static includeZaloAccount(socialId) {
    return {
      model: SocialAccount,
      as: 'socialAccounts',
      where: {
        socialId,
        type: socialAccount.ZALO,
      },
    };
  }

  static getAttributes() {
    return [
      'id',
      'name',
      'phoneNumber',
      'birthday',
      'gender',
      'address',
      'lon',
      'lat',
      'status',
      'role',
      'verifiedAt',
      'avatar',
      'idCardStatus',
      'sessionRole',
    ];
  }
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
    },
    birthday: {
      type: Sequelize.DATE,
    },
    gender: {
      type: Sequelize.DataTypes.TINYINT,
    },
    address: {
      type: Sequelize.STRING,
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'default.png',
      get() {
        const avatar = this.getDataValue('avatar');
        if (avatar && !avatar.startsWith('http')) {
          return `${fileSystemConfig.clout_front}/${avatar}`;
        }
        return avatar;
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    lon: {
      type: Sequelize.DataTypes.DECIMAL(9, 6),
    },
    lat: {
      type: Sequelize.DataTypes.DECIMAL(9, 6),
    },
    role: {
      type: Sequelize.ENUM('USER', 'ADMIN'),
      allowNull: true,
      defaultValue: 'USER',
    },
    sessionRole: {
      type: Sequelize.ENUM('CUSTOMER', 'WORKER'),
      allowNull: true,
      defaultValue: 'CUSTOMER',
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    idCardStatus: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    verifiedAt: {
      type: Sequelize.DATE,
      allowNull: true,
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

User.hasMany(SocialAccount, { as: 'socialAccounts' });
SocialAccount.belongsTo(User);
User.hasOne(UserProfile, { as: 'profile', foreignKey: 'user_id' });
User.belongsToMany(Category, {
  as: 'categories',
  through: 'user_category',
  foreignKey: 'userId',
});

Category.belongsToMany(User, {
  as: 'users',
  through: 'user_category',
  foreignKey: 'categoryId',
});
UserProfile.belongsTo(User);

User.prototype.toPayload = function toPayload() {
  return {
    id: this.dataValues.id,
    phoneNumber: this.dataValues.phoneNumber,
    name: this.dataValues.name,
    status: this.dataValues.status,
    verified_at: this.dataValues.verifiedAt,
  };
};

User.generateHash = async function generateHash(password) {
  return Bcrypt.hash(password, 8);
};

User.prototype.comparePassword = async function comparePassword(password) {
  return Bcrypt.compare(password, this.dataValues.password);
};

User.beforeCreate(async function beforeCreate(user) {
  user.id = uuid.v4();

  if (user.changed('password')) {
    user.password = await User.generateHash(user.password);
  }
  return user;
});

User.beforeBulkUpdate(async function beforeBulkUpdate(options) {
  options.attributes.password =
    options.attributes.password && (await User.generateHash(options.attributes.password));
});

User.updateSkills = async (userId, { categoryIds, yearExperience }) => {
  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId);
    const categories = await user.getCategories();

    if (categories.length) {
      user.removeCategories(categories, { transaction: t });
    }

    if (categoryIds) {
      const createCategories = await Category.findAll({
        where: {
          id: { [Op.in]: categoryIds },
        },
      });

      if (createCategories) {
        await user.addCategories(createCategories, { transaction: t });
      }
    }
    await UserProfile.update(
      { yearExperience },
      {
        where: {
          userId,
        },
        transaction: t,
      }
    );
  });
};

User.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };

  delete values.password;

  return values;
};

module.exports = User;
