import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';

class IssueMaterial extends BaseModel {}

IssueMaterial.init(
  {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    issueId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    cost: {
      type: Sequelize.INTEGER,
    },
    material: {
      type: Sequelize.STRING(2048),
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
    paranoid: true,
    modelName: 'IssueMaterial',
    table: 'issue_materials',
  }
);
IssueMaterial.beforeCreate((instant) => {
  instant.id = uuid.v4();
});

module.exports = IssueMaterial;
