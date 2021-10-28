module.exports = {
  up: async (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('receive_issues', 'discount', {
        type: Sequelize.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        after: 'customer_fee',
        defautValue: 0,
      }),
    ]),

  down: (queryInterface) =>
    Promise.all([queryInterface.removeColumn('receive_issues', 'discount')]),
};
