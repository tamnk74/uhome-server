module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('holidays', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      to: {
        type: Sequelize.DATE,
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
    }),

  down: (queryInterface) => queryInterface.dropTable('holidays'),
};
