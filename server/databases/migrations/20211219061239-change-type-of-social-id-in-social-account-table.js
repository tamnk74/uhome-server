module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('social_accounts', 'social_id', {
      type: Sequelize.DataTypes.STRING(128),
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('social_accounts', 'social_id', {
      type: Sequelize.DataTypes.STRING(128),
    }),
};
