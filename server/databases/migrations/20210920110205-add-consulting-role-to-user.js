module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('ADMIN', 'USER', 'CONSULTING'),
      allowNull: false,
      defaultValue: 'USER',
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('ADMIN', 'USER'),
      allowNull: false,
      defaultValue: 'USER',
    }),
};
