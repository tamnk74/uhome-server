module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('request_supportings', 'province', {
      type: Sequelize.DataTypes.STRING(128),
      after: 'lat',
      defaultValue: 'Da Nang',
    }),

  down: async (queryInterface) => queryInterface.removeColumn('request_supportings', 'province'),
};
