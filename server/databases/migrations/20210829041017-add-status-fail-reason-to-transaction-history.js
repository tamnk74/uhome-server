module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('transaction_histories', 'status', {
        type: Sequelize.DataTypes.ENUM('OPEN', 'PAID', 'FAIL'),
        after: 'currency',
        defaultValue: 'PAID',
      }),
      queryInterface.addColumn('transaction_histories', 'fail_reason', {
        type: Sequelize.DataTypes.TEXT('medium'),
        after: 'currency',
        allowNull: true,
      }),
      queryInterface.changeColumn('transaction_histories', 'method', {
        type: Sequelize.ENUM('system', 'momo', 'cash'),
      }),
    ]),

  down: (queryInterface) =>
    Promise.all([
      queryInterface.removeColumn('transaction_histories', 'status'),
      queryInterface.removeColumn('transaction_histories', 'fail_reason'),
    ]),
};
