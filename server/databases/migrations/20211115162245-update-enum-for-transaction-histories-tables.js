module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('transaction_histories', 'type', {
      type: Sequelize.DataTypes.ENUM('DEPOSIT', 'WITHDRAW', 'WAGE', 'PAY', 'BONUS'),
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('transaction_histories', 'type', {
      type: Sequelize.DataTypes.ENUM('DEPOSIT', 'WITHDRAW', 'WAGE', 'PAY'),
      allowNull: false,
    });
  },
};
