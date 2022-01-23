import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import { fileSystemConfig } from '../config';

class Attachment extends BaseModel {
  static get searchFields() {
    return ['name'];
  }

  static buildUrlAttribuiteSelect() {
    return [Sequelize.literal(`CONCAT('${fileSystemConfig.clout_front}/', path)`), 'url'];
  }

  static getThumbnailAttr() {
    return [
      Sequelize.literal(`CONCAT('${fileSystemConfig.clout_front}/', thumbnail)`),
      'thumbnail_path',
    ];
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
    modelName: 'attachments',
    table: 'attachments',
  }
);

Attachment.baseAttibutes = ['name', 'path', 'size', 'mime_type'];

Attachment.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

module.exports = Attachment;
