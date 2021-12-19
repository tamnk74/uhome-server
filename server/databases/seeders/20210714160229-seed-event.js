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
    limit: data.limit,
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
        code: 'FIRST-5-STAR',
        title: 'Hoàn thành 1 công việc đầu tiên với đánh giá 5 sao',
        image: 'events/event-2.png',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: saleEventTypes.BONUS,
        valueType: calculateType.FIXED,
        limit: -1,
        value: 100000,
        roles: ['WORKER'],
      },
      {
        code: 'NEXT-5-5-STAR',
        title: 'Hoàn thành 5 công việc với đánh giá 5 sao, kể từ công việc thứ 2',
        image: 'events/event-6.png',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: saleEventTypes.BONUS,
        valueType: calculateType.FIXED,
        limit: -1,
        value: 50000,
        roles: ['WORKER'],
      },
      {
        code: '0-DONG-3-VAN-DE',
        title: 'Phí 0 đồng cho 3 lần tạo issue đầu tiên',
        image: 'events/event-0.png',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: saleEventTypes.DISCOUNT,
        valueType: calculateType.FIXED,
        limit: 3,
        value: 100000,
        roles: ['CUSTOMER'],
      },
      {
        code: 'LIEN-KET-MOMO',
        title: 'Liên kết momo nhận Voucher',
        image: 'events/event-4.png',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: saleEventTypes.VOUCHER,
        valueType: calculateType.FIXED,
        limit: 1,
        value: 100000,
        maxValue: 50000,
        roles: ['CUSTOMER', 'WORKER'],
      },
      {
        code: 'MUA-HE-SIEU-NONG',
        title: 'Mùa hè siêu nóng - hot giảm 50% phí sửa chữa máy lạnh - giảm đến 50K.',
        image: 'events/event-3.png',
        from: dayjs(),
        to: dayjs().add(3, 'month'),
        type: saleEventTypes.DISCOUNT,
        valueType: calculateType.PERCENT,
        value: 50,
        limit: -1,
        maxValue: 50000,
        roles: ['CUSTOMER'],
        categories: ['DL'],
      },
    ];

    const promises = events.map((event) => createData(event, queryInterface));

    return Promise.all(promises);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('event_locations', null, {}),
      queryInterface.bulkDelete('event_categories', null, {}),
      queryInterface.bulkDelete('event_scopes', null, {}),
      queryInterface.bulkDelete('event_details', null, {}),
    ]);

    return queryInterface.bulkDelete('events', null, {});
  },
};
