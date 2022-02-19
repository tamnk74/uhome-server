module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('receive_issues', 'start_time', {
        type: Sequelize.DATE,
        after: 'status',
      }),
      queryInterface.addColumn('receive_issues', 'end_time', {
        type: Sequelize.DATE,
        after: 'status',
      }),
      queryInterface.addColumn('receive_issues', 'customer_fee', {
        type: Sequelize.DECIMAL(10, 2),
        after: 'status',
        defaultValue: 0,
      }),
      queryInterface.renameColumn('receive_issues', 'cost', 'worker_fee'),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('receive_issues', 'start_time'),
      queryInterface.removeColumn('receive_issues', 'end_time'),
      queryInterface.removeColumn('receive_issues', 'customer_fee'),
      queryInterface.renameColumn('receive_issues', 'worker_fee', 'cost'),
    ]);
  },
};
