const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: (queryInterface) => {
    const types = [
      {
        id: uuidv4(),
        name: 'Donate',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Discount',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Gift',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Coin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    return queryInterface.bulkInsert('event_types', types, {});
  },

  down: (queryInterface) => queryInterface.bulkDelete('event_types', null, {}),
};
