module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('user_profiles', 'total_rating', {
      type: Sequelize.DataTypes.INTEGER,
      after: 'reliability',
      defaultValue: 0,
    }),

  down: (queryInterface) => queryInterface.removeColumn('user_profiles', 'total_rating'),
};
