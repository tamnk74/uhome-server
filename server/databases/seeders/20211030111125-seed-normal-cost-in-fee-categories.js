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
        cost: 575000,
      },
      {
        code: 'DM',
        cost: 575000,
      },
      {
        code: 'DN',
        cost: 475000,
      },
      {
        code: 'NT',
        cost: 625000,
      },
      {
        code: 'XTVV',
        cost: 475000,
      },
      {
        code: 'TVN',
        cost: 625000,
      },
      {
        code: 'CK',
        cost: 675000,
      },
      {
        code: 'SN',
        cost: 575000,
      },
      {
        code: 'NK',
        cost: 625000,
      },
    ];

    const promises = categories.map((item) => updateData(item));

    return Promise.all(promises);
  },

  down: () => Promise.resolve(),
};
