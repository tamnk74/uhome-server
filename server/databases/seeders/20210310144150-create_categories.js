const { v4: uuidv4 } = require('uuid');
const Category = require('../../models/category');

const mappingData = [
  {
    name: 'Điện lạnh (Điều hòa, Bình nóng lạnh,…)',
    code: 'DL',
  },
  {
    name: 'Điện máy (TV, Quạt,…)',
    code: 'DM',
  },
  {
    name: 'Điện nước',
    code: 'DN',
  },
  {
    name: 'Nội thất',
    code: 'NT',
  },
  {
    name: 'Xây - Tô - Vôi - Vữa',
    code: 'XTVV',
  },
  {
    name: 'Trần - Vách ngăn (Thạch cao, Alu, Cemboard,…)',
    code: 'TVN',
  },
  {
    name: 'Cơ khí',
    code: 'CK',
  },
  {
    name: 'Sơn nước',
    code: 'SN',
  },
  {
    name: 'Nhôm - kính',
    code: 'NK',
  },
];

const updateOrCreate = async (item) => {
  const [category, created] = await Category.findOrCreate({
    where: {
      code: item.code,
    },
    defaults: {
      id: uuidv4(),
      code: item.code,
      name: item.name,
    },
  });

  if (!created) {
    await category.update({
      code: item.code,
      name: item.name,
    });
  }
};

module.exports = {
  up: async () => {
    const promises = mappingData.map((item) => updateOrCreate(item));

    return Promise.all(promises);
  },

  down: (queryInterface) => queryInterface.bulkDelete('categories', null, {}),
};
