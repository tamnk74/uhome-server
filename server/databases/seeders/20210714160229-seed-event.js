const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const Event = require('../../models/event');
const EventPublicRole = require('../../models/eventPublicRole');
const EventLocation = require('../../models/eventLocation');

for

const createData = async (data) => {
  const event = await Event.create({
    title: data.title,
    description: data.description,
    from: data.from,
    to: data.to,
    to: data.to,
    type: data.type,
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
        code: 'TANG-100k-KHI-HOAN-THANH',
        title: 'Tặng ngay 100.000 khi hoàn thành 1 công việc',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: 'Donate',
        value: 100000,
        roles: ['WORKER'],
      },
      {
        code: 'TANG-100k-KHI-HOAN-THANH',
        title: 'Tặng ngay 100.000 khi hoàn thành 1 công việc',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: 'Donate',
        value: 100000,
        roles: ['WORKER'],
      },
      {
        code: 'GIAM-10-3-YEU-CAU',
        title: 'Giảm 10% khi tạo 3 yêu cầu đầu tiên',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: 'Discount',
        value: 10,
        roles: ['CUSTOMER'],
      },
      {
        code: 'LIEN-KET-MOMO',
        title: 'Liên kết momo nhận Voucher',
        from: dayjs(),
        to: dayjs().add(1, 'year'),
        type: 'Gift',
        value: 10,
        maxValue: 50000,
        roles: ['CUSTOMER', 'WORKER'],
      },
      {
        code: 'MUA-HE-SIEU-NONG',
        title: 'Mùa hè siêu nóng - hot giảm 50% phí sửa chữa máy lạnh - giảm đến 50K.',
        from: dayjs(),
        to: dayjs().add(3, 'month'),
        type: 'discount',
        value: 50,
        maxValue: 50000,
        roles: ['CUSTOMER'],
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
