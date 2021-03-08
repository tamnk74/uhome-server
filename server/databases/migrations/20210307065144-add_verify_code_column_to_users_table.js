module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'verified_at', {
      type: Sequelize.DATE,
      after: 'role',
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('users', 'verified_at');
  },
};
