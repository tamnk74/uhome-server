module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('issues', 'msg_at', Sequelize.DataTypes.DATE, {
      allowNull: false,
      before: 'created_at',
      defaultValue: Sequelize.NOW,
    });
  },

  down: (queryInterface) => Promise.all([queryInterface.removeColumn('issues', 'msg_at')]),
};
