module.exports = {
  up: async (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('issue_estimations', 'discount', {
        type: Sequelize.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        after: 'customer_fee',
        defautValue: 0,
      }),
      queryInterface.addColumn('transaction_histories', 'discount', {
        type: Sequelize.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        after: 'amount',
        defautValue: 0,
      }),
      queryInterface.addColumn('transaction_histories', 'total', {
        type: Sequelize.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        after: 'amount',
        defautValue: 0,
      }),
    ]),

  down: (queryInterface) =>
    Promise.all([
      queryInterface.removeColumn('issue_estimations', 'discount'),
      queryInterface.removeColumn('transaction_histories', 'discount'),
      queryInterface.removeColumn('transaction_histories', 'total'),
    ]),
};
