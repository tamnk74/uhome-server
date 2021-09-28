const { roles } = require('../../constants/user');
const User = require('../../models/user');
const Category = require('../../models/category');
const UserCategory = require('../../models/userCategory');

const createUserCategories = async (user, categories) => {
  const promises = categories.map((category) =>
    UserCategory.findOrCreate({
      where: {
        categoryId: category.id,
        userId: user.id,
      },
      defaults: {
        userId: user.id,
        categoryId: category.id,
      },
    })
  );

  return Promise.all(promises);
};
module.exports = {
  up: async () => {
    const [users, categories] = await Promise.all([
      User.findAll({
        where: {
          role: roles.CONSULTING,
        },
      }),
      Category.findAll(),
    ]);

    const promises = users.map((user) => createUserCategories(user, categories));

    return Promise.all(promises);
  },

  down: () => Promise.resolve(),
};
