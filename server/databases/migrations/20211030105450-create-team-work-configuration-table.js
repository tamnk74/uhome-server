module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('team_fee_configurations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      min_worker: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      fee: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'categories',
          key: 'id',
        },
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

  down: (queryInterface) => queryInterface.dropTable('team_fee_configurations'),
};
