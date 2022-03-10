module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_events', 'issue_id', {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: 'issues',
        key: 'id',
      },
      allowNull: true,
      after: 'user_id',
      defaultValue: null,
    });
    await queryInterface.removeColumn('user_events', 'limit');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_events', 'issue_id');
    await queryInterface.addColumn('user_events', 'limit', Sequelize.DataTypes.DECIMAL(12, 2), {
      allowNull: false,
      after: 'image',
      defautValue: -1,
    });
  },
};
