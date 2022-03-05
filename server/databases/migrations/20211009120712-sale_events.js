const { saleEventTypes, calculateType } = require('../../constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.bulkDelete('event_locations', null, {}),
      queryInterface.bulkDelete('event_public_roles', null, {}),
      queryInterface.bulkDelete('event_details', null, {}),
    ]);

    await queryInterface.bulkDelete('events', null, {});

    await queryInterface.addColumn('events', 'value_type', {
      type: Sequelize.ENUM(...Object.values(calculateType)),
      allowNull: false,
      after: 'image',
      defaultValue: calculateType.FIXED,
    });
    await queryInterface.addColumn('events', 'value', {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      after: 'image',
      defaultValue: 0,
    });
    await queryInterface.addColumn('events', 'min_value', {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      after: 'image',
      defaultValue: 0,
    });
    await queryInterface.addColumn('events', 'max_value', {
      type: Sequelize.DataTypes.DECIMAL(12, 2),
      allowNull: false,
      after: 'image',
      defaultValue: 0,
    });
    await queryInterface.removeColumn('events', 'event_type_id');
    await queryInterface.addColumn('events', 'type', {
      type: Sequelize.ENUM(...Object.values(saleEventTypes)),
      allowNull: false,
      after: 'image',
      defaultValue: 0,
    });
    await queryInterface.addColumn('events', 'code', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: '',
      after: 'image',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('events'),
};
