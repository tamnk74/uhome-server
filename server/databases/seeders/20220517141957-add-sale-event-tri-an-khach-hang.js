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
  const categories = await Category.findAll();
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
        code: 'TRI-AN',
        title: 'Tri ân quý khách hàng đã sử dụng dịch vụ Uhome',
        image: 'events/event-1.png',
        from: dayjs(),
        to: dayjs().add(60, 'month'),
        type: saleEventTypes.SPECIAL,
        valueType: calculateType.PERCENT,
        value: 50,
        maxValue: 100000,
        limit: 1,
        roles: ['CUSTOMER'],
        categories: [],
      },
    ];

    const promises = events.map((event) => createData(event, queryInterface));

    return Promise.all(promises);
  },

  down: async () => {},
};
