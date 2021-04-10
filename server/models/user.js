import Sequelize, { Op } from 'sequelize';
import Bcrypt from 'bcryptjs';
import uuid from 'uuid';
import sequelize from '../databases/database';
import BaseModel from './model';
import SocialAccount from './socialAccount';
import UserProfile from './userProfile';
import Category from './category';
import { socialAccount } from '../constants';

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

User.prototype.toPayload = function toPayload() {
  return {
    id: this.dataValues.id,
    phoneNumber: this.dataValues.phoneNumber,
    name: this.dataValues.name,
    status: this.dataValues.status,
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
