import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class Rating extends BaseModel {}

Rating.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    receiveIssueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    rate: {
      type: Sequelize.DataTypes.DECIMAL(2),
      allowNull: false,
    },
    reason: {
      type: Sequelize.STRING(2048),
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    paranoid: true,
    modelName: 'ratings',
    table: 'ratings',
  }
);
Rating.beforeCreate((issue) => {
  issue.id = uuid.v4();
});
module.exports = Rating;
