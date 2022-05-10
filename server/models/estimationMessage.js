import Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { isNil } from 'lodash';
import sequelize from '../databases/database';
import BaseModel from './model';
import { command, estimationMessageStatus } from '../constants/chat';

class EstimationMessage extends BaseModel {}

EstimationMessage.init(
  {
    channelId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    messageSid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM(command.INFORM_MATERIAL_COST, command.REQUEST_ESTIMATION_TIME),
      allowNull: false,
    },
    data: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: Sequelize.ENUM(
        estimationMessageStatus.WAITING,
        estimationMessageStatus.APPROVED,
        estimationMessageStatus.CANCELED
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
    modelName: 'estimation_messages',
    table: 'estimation_messages',
  }
);

EstimationMessage.beforeCreate((instance) => {
  instance.id = uuidv4();
});

EstimationMessage.findByMessageSidOrFail = async (messageSid) => {
  const message = await EstimationMessage.findOne({
    where: {
      messageSid,
    },
  });

  if (isNil(message)) {
    throw new Error('EST-0404');
  }

  return message;
};

EstimationMessage.findByChannelIdAndStatus = (channelId, status) =>
  EstimationMessage.findOne({
    where: {
      channelId,
      status,
    },
  });

EstimationMessage.findByWaitingStatus = (channelId) =>
  EstimationMessage.findOne({
    where: {
      channelId,
      status: estimationMessageStatus.WAITING,
    },
  });

EstimationMessage.findByChannelIdAndStatusAndType = (channelId, status, type) =>
  EstimationMessage.findOne({
    where: {
      channelId,
      status,
      type,
    },
  });

EstimationMessage.baseAttributeOnData = () => [
  'type',
  'worker',
  'customer',
  'unitTime',
  'totalTime',
  'numOfWorker',
  'workingTimes',
  'totalAmount',
  'materials',
  'timeWorkingTypes',
];

module.exports = EstimationMessage;
