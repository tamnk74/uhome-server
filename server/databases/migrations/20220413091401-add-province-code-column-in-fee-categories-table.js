module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('fee_categories', 'province_code', {
      type: Sequelize.DataTypes.STRING(128),
      after: 'normal_cost',
    });

    return queryInterface.addIndex('fee_categories', ['province_code', 'category_id'], {
      name: 'fee_categories_province_code_idx1',
      unique: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('fee_categories', 'fee_categories_province_code_idx1');
    return queryInterface.removeColumn('fee_categories', 'province_code');
  },
};
