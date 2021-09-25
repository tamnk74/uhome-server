import Sequelize from 'sequelize';
import uuid from 'uuid';
import { appTypes } from 'constants';
import BaseModel from './model';
import sequelize from '../databases/database';

class Version extends BaseModel {}

Version.init(
  {
    type: {
      type: Sequelize.ENUM(...Object.values(appTypes)),
      allowNull: false,
    },
    value: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    paranoid: true,
    modelName: 'versions',
    table: 'versions',
  }
);

Version.prototype.getResponse = function getResponse() {
  return {
    version: this.value,
  };
};

Version.baseAttibutes = ['id', 'type', 'value'];

Version.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = Version;
