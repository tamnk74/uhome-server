module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('chat_members', 'member_sid', {
      type: Sequelize.DataTypes.STRING(127),
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('chat_members', 'member_sid');
  },
};
