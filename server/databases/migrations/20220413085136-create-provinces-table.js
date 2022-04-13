module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('provinces', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      country_name: {
        type: Sequelize.DataTypes.STRING(1024),
      },
      country_code: {
        type: Sequelize.DataTypes.STRING(12),
      },
      name: {
        type: Sequelize.DataTypes.STRING(1024),
      },
      code: {
        type: Sequelize.DataTypes.STRING(255),
      },
      postal_code: {
        type: Sequelize.DataTypes.STRING(128),
      },
      status: {
        type: Sequelize.DataTypes.TINYINT,
        defaultValue: 0,
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

    return queryInterface.addIndex('provinces', ['code'], {
      name: 'provinces_code_idx1',
      unique: true,
    });
  },

  down: (queryInterface) => queryInterface.dropTable('provinces'),
};
