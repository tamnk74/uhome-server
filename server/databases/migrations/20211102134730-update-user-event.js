module.exports = {
  up: async (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('user_events', 'status', {
        type: Sequelize.DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
        after: 'user_id',
      }),
    ]),

  down: (queryInterface) => Promise.all([queryInterface.removeColumn('user_events', 'status')]),
};
