import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../databases/database';
import BaseModel from './model';
import { issueStatus } from '../constants';

class Survey extends BaseModel {}

Survey.init(
  {
    channelId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    issueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    messageSid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    data: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: Sequelize.ENUM(issueStatus.APPROVAL, issueStatus.CANCELED, issueStatus.DONE),
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
    table: 'surveys',
  }
);

Survey.beforeCreate((instance) => {
  instance.id = uuidv4();
});

Survey.updateOrCreate = async (where = {}, data = {}) => {
  const [instance, isCreated] = await Survey.findOrCreate({
    where,
    defaults: data,
  });

  if (!isCreated) {
    await instance.update(data);
  }

  return instance;
};

module.exports = Survey;
