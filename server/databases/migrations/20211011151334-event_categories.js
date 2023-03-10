module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('event_categories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      event_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'events',
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
