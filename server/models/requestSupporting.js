import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class RequestSupporting extends BaseModel {}

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
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defautValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defautValue: Sequelize.NOW,
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
