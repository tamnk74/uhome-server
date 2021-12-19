module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('social_accounts', 'type', {
      type: Sequelize.ENUM('FACEBOOK', 'ZALO', 'APPLE'),
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('social_accounts', 'type', {
      type: Sequelize.ENUM('FACEBOOK', 'ZALO'),
    }),
};
