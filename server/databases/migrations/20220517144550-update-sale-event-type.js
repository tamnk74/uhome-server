module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn('events', 'type', {
      type: Sequelize.ENUM('discount', 'bonus', 'voucher', 'special'),
      allowNull: false,
    });
  },
  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn('events', 'type', {
      type: Sequelize.ENUM('discount', 'bonus', 'voucher'),
      allowNull: false,
    });
  },
};
