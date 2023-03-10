const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { roles } = require('../../constants/user');

module.exports = {
  up: async (queryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('uhome123!@#', salt);
    const users = [
      {
        id: uuidv4(),
        name: 'Admin',
        phone_number: '0338021280',
        password,
        role: roles.ADMIN,
        status: 1,
      },
      {
        id: uuidv4(),
        name: 'Thanh',
        phone_number: '0768428040',
        password,
        role: roles.ADMIN,
        status: 1,
      },
      {
        id: uuidv4(),
        name: 'Admin 1',
        phone_number: '0905566438',
        password,
        role: roles.ADMIN,
        status: 1,
      },
    ];

    const userProfiles = [];

    for (let i = 0; i < users.length; i++) {
      userProfiles.push({ userId: users[i].id });
    }

    console.log(users);
    return Promise.all([
      queryInterface.bulkInsert('users', users, {}),
      queryInterface.bulkInsert('user_profiles', userProfiles, {}),
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('users', null, {});
  },
};
