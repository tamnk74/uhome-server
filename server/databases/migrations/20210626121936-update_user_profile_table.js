module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user_profiles', 'account_balance', {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defautValue: 0,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('user_profiles', 'account_balance');
  },
};
