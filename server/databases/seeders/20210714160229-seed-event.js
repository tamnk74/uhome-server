const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const Event = require('../../models/event');
const EventType = require('../../models/eventType');
const EventDetail = require('../../models/eventDetail');
const EventPublicRole = require('../../models/eventPublicRole');
const EventLocation = require('../../models/eventLocation');

const createData = async (data) => {
  const eventType = await EventType.findOne({
    where: {
      name: data.type,
    },
  });
  const event = await Event.create({
    title: data.title,
    from: data.from,
    to: data.to,
    eventTypeId: eventType.id,
  });
  const roles = data.roles || [];
  const eventRoles = roles.map((role) => {
    return {
      id: uuidv4(),
      eventId: event.id,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  await Promise.all([
    EventDetail.create({
      eventId: event.id,
      value: data.value,
    }),
    EventLocation.create({
      eventId: event.id,
      zipCode: data.zipCode,
    }),
    EventPublicRole.bulkCreate(eventRoles),
  ]);
};

module.exports = {
  up: () => {
    const events = [
      {
        title: 'Tặng ngay 100.000 khi hoàn thành 1 công việc',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: 'Donate',
        value: 100000,
        roles: ['WORKER'],
        zipCode: '550000',
      },
      {
        title: 'Giảm 10% khi tạo 3 yêu cầu đầu tiên',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: 'Discount',
        value: 10,
        roles: ['CUSTOMER'],
        zipCode: '550000',
      },
      {
        title: 'Liên kết momo nhận Voucher',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: 'Gift',
        value: 10,
        roles: ['CUSTOMER', 'WORKER'],
        zipCode: '550000',
      },
    ];

    const promises = events.map((event) => createData(event));

    return Promise.all(promises);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('event_locations', null, {}),
      queryInterface.bulkDelete('event_public_roles', null, {}),
      queryInterface.bulkDelete('event_details', null, {}),
    ]);

    return queryInterface.bulkDelete('events', null, {});
  },
};
