module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('categories', 'code', {
      type: Sequelize.DataTypes.STRING,
      after: 'name',
      unique: true,
    }),
  down: (queryInterface) => queryInterface.removeColumn('categories', 'code'),
};
