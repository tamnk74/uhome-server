const { v4: uuidv4 } = require('uuid');
const Category = require('../../models/category');
const TeamFeeConfiguration = require('../../models/teamFeeConfiguration');

const updateOrCreate = async (category, element) => {
  const [feeCategory, created] = await TeamFeeConfiguration.findOrCreate({
    where: {
      categoryId: category.id,
      minWorker: element.min,
    },
    defaults: {
      id: uuidv4(),
      categoryId: category.id,
      minWorker: element.min,
      fee: element.fee,
    },
  });

  if (!created) {
    feeCategory.update({
      minWorker: element.min,
      fee: element.fee,
    });
  }
};

const updateData = async (data) => {
  const category = await Category.findOne({
    where: {
      code: data.code,
    },
  });

  if (category) {
    const { configurations } = data;
    const promises = configurations.map((element) => updateOrCreate(category, element));
    await Promise.all(promises);
  }
};

module.exports = {
  up: () => {
    const categories = [
      {
        code: 'DL',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.15,
          },
          {
            min: 3,
            fee: 0.13,
          },
          {
            min: 5,
            fee: 0.1,
          },
        ],
      },
      {
        code: 'DM',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.15,
          },
          {
            min: 3,
            fee: 0.13,
          },
          {
            min: 5,
            fee: 0.1,
          },
        ],
      },
      {
        code: 'DN',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.1,
          },
          {
            min: 3,
            fee: 0.08,
          },
          {
            min: 5,
            fee: 0.05,
          },
        ],
      },
      {
        code: 'NT',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.1,
          },
          {
            min: 3,
            fee: 0.08,
          },
          {
            min: 5,
            fee: 0.05,
          },
        ],
      },
      {
        code: 'XTVV',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.1,
          },
          {
            min: 3,
            fee: 0.08,
          },
          {
            min: 5,
            fee: 0.05,
          },
        ],
      },
      {
        code: 'TVN',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.12,
          },
          {
            min: 3,
            fee: 0.1,
          },
          {
            min: 5,
            fee: 0.07,
          },
        ],
      },
      {
        code: 'CK',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.12,
          },
          {
            min: 3,
            fee: 0.1,
          },
          {
            min: 5,
            fee: 0.07,
          },
        ],
      },
      {
        code: 'SN',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.1,
          },
          {
            min: 3,
            fee: 0.08,
          },
          {
            min: 5,
            fee: 0.05,
          },
        ],
      },
      {
        code: 'NK',
        configurations: [
          {
            min: 1,
            fee: 0,
          },
          {
            min: 2,
            fee: 0.12,
          },
          {
            min: 3,
            fee: 0.1,
          },
          {
            min: 5,
            fee: 0.07,
          },
        ],
      },
    ];

    const promises = categories.map((item) => updateData(item));

    return Promise.all(promises);
  },

  down: () => Promise.resolve(),
};
