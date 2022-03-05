import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class UserCategory extends BaseModel {}

UserCategory.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    categoryId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'user_category',
    tableName: 'user_category',
    freezeTableName: true,
  }
);
UserCategory.removeAttribute('id');
UserCategory.removeAttribute('deletedAt');

UserCategory.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = UserCategory;
