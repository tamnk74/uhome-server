module.exports = {
  up: (queryInterface) => {
    return Promise.all([queryInterface.removeColumn('transactions', 'payment_id')]);
  },

  down: () => {},
};
