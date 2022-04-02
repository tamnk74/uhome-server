import Sequelize from 'sequelize';
import uuid from 'uuid';
import BaseModel from './model';
import sequelize from '../databases/database';
import Event from './event';
import { eventStatuses } from '../constants';
import EventScope from './eventScope';
import { fileSystemConfig } from '../config';

class Banner extends BaseModel {}

Banner.init(
  {
    eventId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
    },
    image: {
      type: Sequelize.DataTypes.STRING(1024),
      get() {
        const storedValue = this.getDataValue('image');
        return `${fileSystemConfig.clout_front}/${storedValue}`;
      },
    },
    status: {
      type: Sequelize.DataTypes.TINYINT,
      defaultValue: 0,
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
    modelName: 'banner',
    table: 'banners',
  }
);

Banner.beforeCreate((instance) => {
  instance.id = uuid.v4();
});

Banner.baseAttributes = ['id', 'status', 'image', 'createdAt'];
Banner.belongsTo(Event);
Banner.buildRelation = (sessionRole) => {
  return [
    {
      model: Event,
      where: {
        status: eventStatuses.ACTIVE,
      },
      attributes: Event.baseAttributes,
      include: [
        {
          model: EventScope,
          where: {
            scope: sessionRole,
          },
        },
      ],
    },
  ];
};

module.exports = Banner;
