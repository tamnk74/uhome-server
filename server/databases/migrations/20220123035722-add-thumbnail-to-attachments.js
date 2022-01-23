module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('attachments', 'thumbnail', {
      type: Sequelize.DataTypes.STRING,
      after: 'path',
    }),

  down: (queryInterface) => queryInterface.removeColumn('attachments', 'thumbnail'),
};
