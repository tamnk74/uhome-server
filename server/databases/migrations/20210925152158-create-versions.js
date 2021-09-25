const { appTypes } = require('../../constants');

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'versions',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.UUID,
        },
        type: {
          type: Sequelize.ENUM(...Object.values(appTypes)),
          allowNull: false,
        },
        value: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        uniqueKeys: {
          unique_versions: {
            customIndex: true,
            fields: ['type'],
          },
        },
      }
    ),

  down: (queryInterface) => queryInterface.dropTable('versions'),
};
