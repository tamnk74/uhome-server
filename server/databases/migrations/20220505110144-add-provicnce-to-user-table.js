module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'province', {
      type: Sequelize.DataTypes.STRING(128),
      after: 'lat',
    }),

  down: (queryInterface) => queryInterface.removeColumn('users', 'province'),
};
