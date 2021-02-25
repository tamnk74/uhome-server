const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const users = [
      {
        id: uuidv4(),
        name: 'Admin',
        email: 'khac.tam.94@gmail.com',
        fullName: 'Admin',
        password: await bcrypt.hash('admin123!@#', salt),
        role: 'ADMIN',
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Thanh',
        email: 'thanhnpn@gmail.com',
        fullName: 'Thanh NPN',
        password: await bcrypt.hash('admin123!@#', salt),
        role: 'ADMIN',
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('users', users, {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('users', null, {});
  },
};
