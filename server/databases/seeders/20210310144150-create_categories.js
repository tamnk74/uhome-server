const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const categories = [
      {
        id: uuidv4(),
        name: 'Sửa chữa hệ thống điện',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Sửa chữa đồ điện tử',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Sửa chữa hệ thống nước',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Sửa chữa đồ gỗ, nội thất',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Sửa chữa nhà cửa',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    return queryInterface.bulkInsert('categories', categories, {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('categories', null, {});
  },
};
