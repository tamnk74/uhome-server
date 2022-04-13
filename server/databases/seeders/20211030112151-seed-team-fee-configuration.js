const { v4: uuidv4 } = require('uuid');
const Category = require('../../models/category');
const TeamFeeConfiguration = require('../../models/teamFeeConfiguration');

const updateOrCreate = async (category, provinceCode, element) =>
  TeamFeeConfiguration.upsert({
    id: uuidv4(),
    categoryId: category.id,
    provinceCode,
    minWorker: element.min,
    fee: element.fee,
  });

const updateData = async ({ provinceCode, configurations = [] }) => {
  for (let index = 0; index < configurations.length; index++) {
    const configuration = configurations[index];
    // eslint-disable-next-line no-await-in-loop
    const category = await Category.findOne({
      where: {
        code: configuration.code,
      },
    });

    if (category) {
      const { configurations } = configuration;
      for (let index = 0; index < configurations.length; index++) {
        const element = configurations[index];
        // eslint-disable-next-line no-await-in-loop
        await updateOrCreate(category, provinceCode, element);
      }
    }
  }
};

module.exports = {
  up: () => {
    const categories = [
      {
        provinceCode: 'Da Nang',
        configurations: [
          {
            code: 'DL',
            configurations: [
              {
                min: 1,
                fee: 0,
              },
              {
                min: 2,
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
              },
            ],
          },
        ],
      },
      {
        provinceCode: 'Quang Nam Province',
        configurations: [
          {
            code: 'DL',
            configurations: [
              {
                min: 1,
                fee: 0,
              },
              {
                min: 2,
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
              },
            ],
          },
        ],
      },
      {
        provinceCode: 'Ho Chi Minh City',
        configurations: [
          {
            code: 'DL',
            configurations: [
              {
                min: 1,
                fee: 0,
              },
              {
                min: 2,
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
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
                fee: 0.05,
              },
              {
                min: 3,
                fee: 0.08,
              },
              {
                min: 5,
                fee: 0.08,
              },
            ],
          },
        ],
      },
    ];

    const promises = categories.map((item) => updateData(item));

    return Promise.all(promises);
  },

  down: () => Promise.resolve(),
};
