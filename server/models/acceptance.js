import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../databases/database';
import BaseModel from './model';
import { issueStatus } from '../constants';

class Acceptance extends BaseModel {}

Acceptance.init(
  {
    channelId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    messageSid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    receiveIssueId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    data: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: Sequelize.ENUM(
        issueStatus.WAITING_VERIFY,
        issueStatus.WAITING_PAYMENT,
        issueStatus.CANCELED,
        issueStatus.DONE
      ),
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
    table: 'acceptances',
  }
);

Acceptance.beforeCreate((instance) => {
  instance.id = uuidv4();
});

Acceptance.updateOrCreate = async (where = {}, data = {}) => {
  const [acceptance, isCreated] = await Acceptance.findOrCreate({
    where,
    defaults: data,
  });

  if (!isCreated) {
    await acceptance.update(data);
  }

  return acceptance;
};

module.exports = Acceptance;
