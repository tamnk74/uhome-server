module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'limit', Sequelize.DataTypes.DECIMAL(12, 2), {
      allowNull: false,
      after: 'image',
      defautValue: -1,
    });
    await queryInterface.renameColumn('user_events', 'status', 'limit');
  },

  down: (queryInterface) =>
    Promise.all([
      queryInterface.removeColumn('events', 'limit'),
      queryInterface.renameColumn('user_events', 'limit', 'status'),
    ]),
};
