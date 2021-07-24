const { v4: uuidv4 } = require('uuid');
const Category = require('../../models/category');
const FeeCategory = require('../../models/feeCategory');

const createData = async (data) => {
  const category = await Category.findOne({
    where: {
      name: data.name,
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
        name: 'Sửa chữa hệ thống điện',
        min: 550000,
        max: 600000,
      },
      {
        name: 'Sửa chữa đồ điện tử',
        min: 400000,
        max: 450000,
      },
      {
        name: 'Sửa chữa hệ thống nước',
        min: 500000,
        max: 550000,
      },
      {
        name: 'Sửa chữa đồ gỗ, nội thất',
        min: 600000,
        max: 650000,
      },
      {
        name: 'Sửa chữa nhà cửa',
        min: 700000,
        max: 750000,
      },
    ];
    const promises = categories.map((item) => createData(item));

    return Promise.all(promises);
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('fee_categories', null, {});
  },
};
