const { Op } = require('sequelize');
const Category = require('../../models/category');

const mappingData = [
  {
    name: 'Sửa chữa hệ thống điện',
    newName: 'Điện Lạnh( Điều hoà, Bình nóng lạnh,..)',
    code: 'DL',
  },
  {
    name: 'Sửa chữa đồ điện tử',
    newName: 'Điện Máy( TV, Quạt,...)',
    code: 'DM',
  },
  {
    name: 'Sửa chữa hệ thống nước',
    newName: 'Điện Nước',
    code: 'DN',
  },
  {
    name: 'Sửa chữa đồ gỗ, nội thất',
    newName: 'Nội thất',
    code: 'NT',
  },
  {
    name: 'Sửa chữa nhà cửa',
    newName: 'Xây - Tô - Vôi - Vữa',
    code: 'XTVV',
  },
  {
    name: 'Trần - Vách Ngăn (Thạch Cao, Alu, Cemboard,...)',
    newName: 'Trần - Vách Ngăn (Thạch Cao, Alu, Cemboard,...)',
    code: 'TVN',
  },
  {
    name: 'Cơ khí',
    newName: 'Cơ khí',
    code: 'CK',
  },
  {
    name: 'Sơn nước',
    newName: 'Sơn nước',
    code: 'SN',
  },
  {
    name: 'Nhôm-kính',
    newName: 'Nhôm-kính',
    code: 'NK',
  },
];

const updateOrCreate = async (item) => {
  const category = await Category.findOne({
    where: {
      name: {
        [Op.or]: [item.name, item.newName],
      },
    },
  });

  if (category) {
    await category.update({
      code: item.code,
      name: item.newName,
    });
  } else {
    await Category.create({
      code: item.code,
      name: item.newName,
      description: item.newName,
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
