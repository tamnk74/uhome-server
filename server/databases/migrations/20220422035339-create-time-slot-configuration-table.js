module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('time_slot_configurations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      category_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'categories',
          key: 'id',
        },
        allowNull: false,
      },
      min: {
        type: Sequelize.DataTypes.TINYINT,
      },
      max: {
        type: Sequelize.DataTypes.TINYINT,
      },
      province: {
        type: Sequelize.DataTypes.STRING,
      },
      cost: {
        type: Sequelize.DataTypes.FLOAT,
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

    return queryInterface.addIndex('time_slot_configurations', ['province', 'min', 'category_id'], {
      name: 'time_slot_configurations_country_min_idx1',
      unique: true,
    });
  },

  down: async (queryInterface) => queryInterface.dropTable('time_slot_configurations'),
};
