module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('team_fee_configurations', 'province_code', {
      type: Sequelize.DataTypes.STRING(128),
      after: 'category_id',
    });

    return queryInterface.addIndex(
      'team_fee_configurations',
      ['province_code', 'category_id', 'min_worker'],
      {
        name: 'team_fee_configurations_province_code_idx1',
        unique: true,
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex(
      'team_fee_configurations',
      'team_fee_configurations_province_code_idx1'
    );
    return queryInterface.removeColumn('team_fee_configurations', 'province_code');
  },
};
