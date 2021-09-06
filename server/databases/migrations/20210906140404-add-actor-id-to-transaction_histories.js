module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('transaction_histories', 'actor_id', {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      after: 'user_id',
      allowNull: true,
    }),

  down: (queryInterface) => queryInterface.removeColumn('transaction_histories', 'actor_id'),
};
