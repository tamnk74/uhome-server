const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { roles } = require('../../constants/user');
const User = require('../../models/user');

module.exports = {
  up: async (queryInterface) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('uhome123!@#', salt);
    const users = [
      {
        id: uuidv4(),
        name: 'Consulting',
        phone_number: '6789686868',
        password,
        role: roles.CONSULTING,
        status: 1,
        session_role: null,
      },
    ];
    const userProfiles = [];

    for (let i = 0; i < users.length; i++) {
      userProfiles.push({
        id: uuidv4(),
        account_balance: 0,
        user_id: users[i].id,
        identity_card: '{"after": null, "before": null}',
      });
    }

    return Promise.all([
      queryInterface.bulkInsert('users', users, {}),
      queryInterface.bulkInsert('user_profiles', userProfiles, {}),
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await User.destroy({
      where: {
        phoneNumber: '6789686868',
      },
      force: true,
    });

    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
  },
};
