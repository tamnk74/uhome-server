module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('event_categories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'issues',
          key: 'id',
        },
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
    }),

  down: (queryInterface) => queryInterface.dropTable('event_categories'),
};
