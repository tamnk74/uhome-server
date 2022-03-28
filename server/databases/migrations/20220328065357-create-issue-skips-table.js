module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('issue_skips', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'issues',
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'users',
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
    });
    return queryInterface.addIndex('issue_skips', ['user_id', 'issue_id'], {
      indexName: 'issue_skips_user_id_fk1',
      unique: true,
    });
  },

  down: (queryInterface) => queryInterface.dropTable('issue_skips'),
};
