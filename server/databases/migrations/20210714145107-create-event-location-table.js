module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('event_locations', {
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
      zip_code: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('event_locations');
  },
};
