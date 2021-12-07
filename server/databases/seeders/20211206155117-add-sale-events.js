const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const Event = require('../../models/event');
const Category = require('../../models/category');
const EventScope = require('../../models/eventScope');
const { saleEventTypes, calculateType } = require('../../constants');

const createData = async (data, queryInterface) => {
  const event = await Event.create({
    title: data.title,
    description: data.description,
    image: data.image,
    code: data.code,
    valueType: data.valueType,
    value: data.value,
    minValue: data.minValue,
    maxValue: data.maxValue,
    from: data.from,
    to: data.to,
    status: 1,
    type: data.type,
  });
  const roles = data.roles || [];
  const eventRoles = roles.map((role) => {
    return {
      id: uuidv4(),
      eventId: event.id,
      scope: role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  const categories = await Category.findAll({
    where: {
      code: data.categories || [],
    },
  });
  const eventCategories = categories.map((category) => ({
    id: uuidv4(),
    event_id: event.id,
    category_id: category.id,
  }));
  console.log(eventRoles, eventCategories);
  await Promise.all([
    eventRoles.length && EventScope.bulkCreate(eventRoles),
    eventCategories.length && queryInterface.bulkInsert('event_categories', eventCategories, {}),
  ]);
};

module.exports = {
  up: (queryInterface) => {
    const events = [
      {
        code: 'NGOI-NHA-AM-AP',
        title:
          'Ngôi nhà ấm áp - hot giảm 50% phí sửa chữa máy nước nóng, hệ thống nóng lạnh trong nhà, máy sưởi, điều hoà - giảm đến 100K.',
        image: 'events/event-3.png',
        from: dayjs(),
        to: dayjs().add(3, 'month'),
        type: saleEventTypes.DISCOUNT,
        valueType: calculateType.PERCENT,
        value: 50,
        maxValue: 100000,
        roles: ['CUSTOMER'],
        categories: ['DL', 'DM', 'DN'],
      },
      {
        code: 'TUOM-TAT-DON-XUAN',
        title:
          'TƯƠM TÂT ĐÓN XUÂN - hot giảm 15% phí, maximum lên đến 500K cho việc sơn sửa nhà lại nhà cửa',
        image: 'events/event-3.png',
        from: dayjs(),
        to: dayjs().add(3, 'month'),
        type: saleEventTypes.DISCOUNT,
        valueType: calculateType.PERCENT,
        value: 15,
        maxValue: 500000,
        roles: ['CUSTOMER'],
        categories: ['TVN', 'SN'],
      },
    ];

    const promises = events.map((event) => createData(event, queryInterface));

    return Promise.all(promises);
  },

  down: async () => {},
};
