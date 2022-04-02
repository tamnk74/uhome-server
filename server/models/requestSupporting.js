import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class RequestSupporting extends BaseModel {
  static getAttributes() {
    return ['id', 'userId', 'issueId', 'message', 'lat', 'lon', 'distance', 'distanceFee'];
  }
}

RequestSupporting.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    issueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    },
    lat: {
      type: Sequelize.DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
    lon: {
      type: Sequelize.DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },
    distance: {
      type: Sequelize.DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    distanceFee: {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 0,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
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
    timestamps: true,
    paranoid: false,
    modelName: 'request_supportings',
    table: 'request_supportings',
  }
);

RequestSupporting.beforeCreate((requestSupporting) => {
  requestSupporting.id = uuid.v4();
});

module.exports = RequestSupporting;
