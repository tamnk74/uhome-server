module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('fee_configurations', 'province_code', {
      type: Sequelize.DataTypes.STRING(128),
      after: 'max_distance_fee',
    });

    return queryInterface.addIndex('fee_configurations', ['province_code'], {
      name: 'fee_configurations_province_code_idx1',
      unique: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('fee_configurations', 'fee_configurations_province_code_idx1');
    return queryInterface.removeColumn('fee_configurations', 'province_code');
  },
};
