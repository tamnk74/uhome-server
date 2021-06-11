import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import User from './user';

class IdentifyCard extends BaseModel {}

IdentifyCard.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    idNum: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    },
    hometown: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    raw: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    paranoid: true,
    modelName: 'identify_cards',
    table: 'identify_cards',
  }
);

IdentifyCard.beforeCreate((identifyCard) => {
  identifyCard.id = uuid.v4();
});

IdentifyCard.belongsTo(User);
User.hasOne(IdentifyCard);

module.exports = IdentifyCard;
