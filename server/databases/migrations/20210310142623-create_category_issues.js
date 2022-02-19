module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('category_issues', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      category_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'categories',
          key: 'id',
        },
        allowNull: false,
      },
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'issues',
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
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('category_issues');
  },
};
