import { Sequelize, Op } from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class FeeConfiguration extends BaseModel {}

FeeConfiguration.init(
  {
    workerFee: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    customerFee: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    distance: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    nightTime: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    urgentTime: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    holiday: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    experienceFee: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    maxDistanceFee: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
    minDistance: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    provinceCode: {
      type: Sequelize.STRING,
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
    modelName: 'FeeConfiguration',
    table: 'fee_configurations',
  }
);

FeeConfiguration.beforeCreate((instance) => {
  instance.id = uuid.v4();
});
FeeConfiguration.baseAttributes = [
  'id',
  'workerFee',
  'customerFee',
  'distance',
  'nightTime',
  'urgentTime',
  'holiday',
  'experienceFee',
];

FeeConfiguration.findByProvinces = (provinces = []) =>
  FeeConfiguration.findOne({
    where: {
      [Op.or]: [
        {
          provinceCode: provinces,
        },
        {
          provinceCode: {
            [Op.eq]: null,
          },
        },
      ],
    },
    order: [['provinceCode', 'DESC']],
  });

module.exports = FeeConfiguration;
