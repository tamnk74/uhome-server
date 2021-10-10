const { saleEventTypes } = require('../../constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'value', {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      after: 'image',
      defautValue: 0,
    });
    await queryInterface.addColumn('events', 'min_value', {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      after: 'image',
      defautValue: 0,
    });
    await queryInterface.addColumn('events', 'max_value', {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      after: 'image',
      defautValue: 1000000000,
    });
    await queryInterface.removeColumn('events', 'event_type_id');
    await queryInterface.addColumn('events', 'type', {
      type: Sequelize.ENUM(...Object.values(saleEventTypes)),
      allowNull: false,
      after: 'image',
      defautValue: 0,
    });
    await queryInterface.addColumn('events', 'code', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      defaultValue: 'UHOME-CODE',
      after: 'image',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('events'),
};
