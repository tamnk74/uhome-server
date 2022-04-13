const uuid = require('uuid');
const Province = require('../../models/province');

module.exports = {
  up: async () => {
    const data = [
      {
        name: 'Đà Nẵng',
        code: 'Da Nang',
        country_name: 'Vietnam',
        country_code: 'VN',
        postal_code: '550000',
        status: 1,
      },
      {
        name: 'Quảng Nam',
        code: 'Quang Nam Province',
        country_name: 'Vietnam',
        country_code: 'VN',
        postal_code: '551000',
        status: 1,
      },
      {
        name: 'Thành phố Hồ Chí Minh',
        code: 'Ho Chi Minh City',
        country_name: 'Vietnam',
        country_code: 'VN',
        postal_code: '570000',
        status: 1,
      },
    ];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      // eslint-disable-next-line no-await-in-loop
      await Province.upsert({
        id: uuid.v4(),
        ...element,
      });
    }

    return Promise.resolve();
  },

  down: () => Promise.resolve(),
};
