module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('event_details', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      event_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'events',
          key: 'id',
        },
        allowNull: false,
      },
      value: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
      },
      max_value: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
      },
      gift: {
        type: Sequelize.DataTypes.STRING(255),
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
    return queryInterface.dropTable('event_details');
  },
};
