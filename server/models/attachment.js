import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import { fileSystemConfig } from '../config';

class Attachment extends BaseModel {
  static get searchFields() {
    return ['name'];
  }

  static buildUrlAttributeSelect() {
    return [Sequelize.literal(`CONCAT('${fileSystemConfig.clout_front}/', path)`), 'url'];
  }
}

Attachment.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    path: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    thumbnailPath: {
      type: Sequelize.DataTypes.VIRTUAL,
      get() {
        return this.thumbnail
          ? `${fileSystemConfig.clout_front}/${this.thumbnail}`
          : this.thumbnail;
      },
      set() {
        throw new Error('Do not try to set the `thumbnailPath` value!');
      },
    },
    url: {
      type: Sequelize.DataTypes.VIRTUAL,
      get() {
        return this.path ? `${fileSystemConfig.clout_front}/${this.path}` : this.path;
      },
      set() {
        throw new Error('Do not try to set the `url` value!');
      },
    },
    issueId: {
      type: Sequelize.UUID,
      references: { model: 'Issue', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    },
    size: {
      type: Sequelize.INTEGER,
    },
    mimeType: {
      type: Sequelize.STRING,
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
    paranoid: true,
    modelName: 'attachments',
    table: 'attachments',
  }
);

Attachment.baseAttributes = ['name', 'path', 'size', 'mimeType'];

Attachment.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = Attachment;
