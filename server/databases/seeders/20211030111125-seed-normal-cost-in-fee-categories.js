const FeeCategory = require('../../models/feeCategory');
const Category = require('../../models/category');

const updateData = async (data) => {
  const category = await Category.findOne({
    where: {
      code: data.code,
    },
  });
  if (category) {
    await FeeCategory.update(
      {
        normalCost: data.cost,
      },
      {
        where: {
          categoryId: category.id,
        },
      }
    );
  }
};

module.exports = {
  up: () => {
    const categories = [
      {
        code: 'DL',
        cost: 400000,
      },
      {
        code: 'DM',
        cost: 400000,
      },
      {
        code: 'DN',
        cost: 400000,
      },
      {
        code: 'NT',
        cost: 400000,
      },
      {
        code: 'XTVV',
        cost: 400000,
      },
      {
        code: 'TVN',
        cost: 400000,
      },
      {
        code: 'CK',
        cost: 400000,
      },
      {
        code: 'SN',
        cost: 400000,
      },
      {
        code: 'NK',
        cost: 400000,
      },
    ];

    const promises = categories.map((item) => updateData(item));

    return Promise.all(promises);
  },

  down: () => Promise.resolve(),
};
