import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import User from './user';

class IdentifyCard extends BaseModel {}

IdentifyCard.init(
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
    idNum: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
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
