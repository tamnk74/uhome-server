const { v4: uuidv4 } = require('uuid');
const Category = require('../../models/category');
const FeeCategory = require('../../models/feeCategory');

const upsertData = async (provinceCode, item) => {
  const category = await Category.findOne({
    where: {
      code: item.code,
    },
  });

  if (category) {
    return FeeCategory.upsert({
      id: uuidv4(),
      min: item.min,
      max: item.max,
      normalCost: item.normalCost,
      categoryId: category.id,
      provinceCode,
    });
  }
};

const createData = async ({ provinceCode, categories = [] }) => {
  for (let index = 0; index < categories.length; index++) {
    const feeCategory = categories[index];
    // eslint-disable-next-line no-await-in-loop
    await upsertData(provinceCode, feeCategory);
  }
};

module.exports = {
  up: async () => {
    const categories = [
      {
        provinceCode: 'Da Nang',
        categories: [
          {
            code: 'DL',
            min: 550000,
            max: 600000,
            normalCost: 575000,
          },
          {
            code: 'DM',
            min: 550000,
            max: 600000,
            normalCost: 575000,
          },
          {
            code: 'DN',
            min: 450000,
            max: 500000,
            normalCost: 475000,
          },
          {
            code: 'NT',
            min: 600000,
            max: 650000,
            normalCost: 625000,
          },
          {
            code: 'XTVV',
            min: 450000,
            max: 500000,
            normalCost: 475000,
          },
          {
            code: 'TVN',
            min: 600000,
            max: 650000,
            normalCost: 625000,
          },
          {
            code: 'CK',
            min: 650000,
            max: 700000,
            normalCost: 675000,
          },
          {
            code: 'SN',
            min: 550000,
            max: 600000,
            normalCost: 575000,
          },
          {
            code: 'NK',
            min: 600000,
            max: 650000,
            normalCost: 625000,
          },
        ],
      },
      {
        provinceCode: 'Quang Nam Province',
        categories: [
          {
            code: 'DL',
            min: 550000,
            max: 600000,
            normalCost: 575000,
          },
          {
            code: 'DM',
            min: 550000,
            max: 600000,
            normalCost: 575000,
          },
          {
            code: 'DN',
            min: 450000,
            max: 500000,
            normalCost: 475000,
          },
          {
            code: 'NT',
            min: 600000,
            max: 650000,
            normalCost: 625000,
          },
          {
            code: 'XTVV',
            min: 450000,
            max: 500000,
            normalCost: 475000,
          },
          {
            code: 'TVN',
            min: 600000,
            max: 650000,
            normalCost: 625000,
          },
          {
            code: 'CK',
            min: 650000,
            max: 700000,
            normalCost: 675000,
          },
          {
            code: 'SN',
            min: 550000,
            max: 600000,
            normalCost: 575000,
          },
          {
            code: 'NK',
            min: 600000,
            max: 650000,
            normalCost: 625000,
          },
        ],
      },
      {
        provinceCode: 'Ho Chi Minh City',
        categories: [
          {
            code: 'DL',
            min: 550000,
            max: 700000,
            normalCost: 625000,
          },
          {
            code: 'DM',
            min: 500000,
            max: 650000,
            normalCost: 575000,
          },
          {
            code: 'DN',
            min: 450000,
            max: 650000,
            normalCost: 550000,
          },
          {
            code: 'NT',
            min: 500000,
            max: 750000,
            normalCost: 625000,
          },
          {
            code: 'XTVV',
            min: 550000,
            max: 700000,
            normalCost: 625000,
          },
          {
            code: 'TVN',
            min: 550000,
            max: 700000,
            normalCost: 625000,
          },
          {
            code: 'CK',
            min: 550000,
            max: 750000,
            normalCost: 650000,
          },
          {
            code: 'SN',
            min: 550000,
            max: 650000,
            normalCost: 600000,
          },
          {
            code: 'NK',
            min: 550000,
            max: 700000,
            normalCost: 625000,
          },
        ],
      },
    ];

    for (let index = 0; index < categories.length; index++) {
      const feeCategory = categories[index];
      // eslint-disable-next-line no-await-in-loop
      await createData(feeCategory);
    }

    return Promise.resolve();
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('fee_categories', null, {});
  },
};
