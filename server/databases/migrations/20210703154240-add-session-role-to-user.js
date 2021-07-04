module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'session_role', {
      type: Sequelize.ENUM('CUSTOMER', 'WORKER'),
      after: 'role',
      defaultValue: 'CUSTOMER',
    });
  },

  down: (queryInterface) => queryInterface.removeColumn('users', 'session_role'),
};
