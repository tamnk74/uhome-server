module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('event_public_roles', {
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
      role: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
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
    return queryInterface.dropTable('event_public_roles');
  },
};
