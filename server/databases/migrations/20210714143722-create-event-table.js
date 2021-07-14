module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('events', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      event_type_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'event_types',
          key: 'id',
        },
        allowNull: false,
      },
      title: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
      },
      image: {
        type: Sequelize.DataTypes.STRING(1024),
      },
      from: {
        type: Sequelize.DATE,
        defautValue: Sequelize.NOW,
      },
      to: {
        type: Sequelize.DATE,
        defautValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.DataTypes.TINYINT,
        defautValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defautValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defautValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('events');
  },
};
