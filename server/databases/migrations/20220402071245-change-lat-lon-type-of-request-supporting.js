module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.changeColumn('request_supportings', 'lat', {
        type: Sequelize.DataTypes.DECIMAL(9, 6),
      }),
      queryInterface.changeColumn('request_supportings', 'lon', {
        type: Sequelize.DataTypes.DECIMAL(9, 6),
      }),
    ]),

  down: () => Promise.resolve(),
};
