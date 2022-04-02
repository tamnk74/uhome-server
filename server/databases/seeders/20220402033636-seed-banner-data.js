const uuid = require('uuid');
const Banner = require('../../models/banner');
const Event = require('../../models/event');

const upsertBanner = async (code, image) => {
  const event = await Event.findOne({
    where: {
      code,
    },
  });

  if (event) {
    const [banner, isCreated] = await Banner.findOrCreate({
      where: {
        eventId: event.id,
      },
      defaults: {
        id: uuid.v4(),
        eventId: event.id,
        image,
        status: 1,
      },
    });

    if (!isCreated) {
      await banner.update({ image });
    }
  }
};

module.exports = {
  up: async () => {
    const data = [
      {
        code: 'LIEN-KET-MOMO',
        image: 'events/banner-lien-ket-momo.png',
      },
      {
        code: 'NGOI-NHA-AM-AP',
        image: 'events/banner-sale-50-100.png',
      },
      {
        code: '0-DONG-3-VAN-DE',
        image: 'events/banner-0-fee.png',
      },
    ];
    const promises = [];
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      promises.push(upsertBanner(item.code, item.image));
    }
    return Promise.all(promises);
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('banners', null, {});
  },
};
