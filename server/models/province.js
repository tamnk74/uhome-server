import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class Province extends BaseModel {
  static get IS_ENABLED() {
    return 1;
  }
}

Province.init(
  {
    country_name: {
      type: Sequelize.DataTypes.STRING,
    },
    country_code: {
      type: Sequelize.DataTypes.STRING,
    },
    name: {
      type: Sequelize.DataTypes.STRING,
    },
    code: {
      type: Sequelize.DataTypes.STRING,
    },
    postal_code: {
      type: Sequelize.DataTypes.STRING,
    },
    status: {
      type: Sequelize.DataTypes.TINYINT,
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
    modelName: 'province',
    table: 'provinces',
  }
);

Province.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

Province.baseAttributes = [
  'id',
  'status',
  'code',
  'name',
  'countryName',
  'countryCode',
  'createdAt',
];

module.exports = Province;
