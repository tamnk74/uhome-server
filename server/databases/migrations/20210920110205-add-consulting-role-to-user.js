module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('ADMIN', 'USER', 'CONSULTING'),
      allowNull: false,
      defautValue: 'USER',
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('ADMIN', 'USER'),
      allowNull: false,
      defautValue: 'USER',
    }),
};
