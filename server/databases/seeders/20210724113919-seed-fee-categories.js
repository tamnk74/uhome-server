const { v4: uuidv4 } = require('uuid');
const Category = require('../../models/category');
const FeeCategory = require('../../models/feeCategory');

const createData = async (data) => {
  const category = await Category.findOne({
    where: {
      code: data.code,
    },
  });
  if (category) {
    const [feeCategory, created] = await FeeCategory.findOrCreate({
      where: {
        categoryId: category.id,
      },
      defaults: {
        id: uuidv4(),
        min: data.min,
        max: data.max,
      },
    });

    if (!created) {
      feeCategory.update({
        min: data.min,
        max: data.max,
      });
    }
  }
};

module.exports = {
  up: () => {
    const categories = [
      {
        code: 'DL',
        min: 550000,
        max: 600000,
      },
      {
        code: 'DM',
        min: 550000,
        max: 600000,
      },
      {
        code: 'DN',
        min: 450000,
        max: 500000,
      },
      {
        code: 'NT',
        min: 600000,
        max: 650000,
      },
      {
        code: 'XTVV',
        min: 450000,
        max: 500000,
      },
      {
        code: 'TVN',
        min: 600000,
        max: 650000,
      },
      {
        code: 'CK',
        min: 650000,
        max: 700000,
      },
      {
        code: 'SN',
        min: 550000,
        max: 600000,
      },
      {
        code: 'NK',
        min: 600000,
        max: 650000,
      },
    ];
    const promises = categories.map((item) => createData(item));

    return Promise.all(promises);
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('fee_categories', null, {});
  },
};
