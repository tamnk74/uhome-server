module.exports = {
  up: async (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('issues', 'event_id', {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'events',
          key: 'id',
        },
        allowNull: true,
      }),
    ]),

  down: (queryInterface) => Promise.all([queryInterface.removeColumn('issues', 'event_id')]),
};
