module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('identify_cards', 'dob', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('identify_cards', 'dob', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    }),
};
