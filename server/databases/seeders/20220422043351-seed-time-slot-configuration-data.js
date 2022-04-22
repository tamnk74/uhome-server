const uuid = require('uuid');
const configurations = require('../data/time-slot-configuration.json');
const TimeSlotConfiguration = require('../../models/timesSlotConfiguration');
const Category = require('../../models/category');

const upsertTimeSlot = (category, province, item) =>
  TimeSlotConfiguration.upsert({
    id: uuid.v4(),
    categoryId: category.id,
    province,
    min: item.min,
    max: item.max,
    cost: item.cost,
  });

const addTimeSlots = async (configure) => {
  const { timeSlots, province } = configure;

  for (let index = 0; index < timeSlots.length; index++) {
    const item = timeSlots[index];
    // eslint-disable-next-line no-await-in-loop
    const category = await Category.findOne({
      where: {
        code: item.category_code,
      },
    });

    // eslint-disable-next-line no-await-in-loop
    await upsertTimeSlot(category, province, item);
  }
};

module.exports = {
  up: async () => {
    for (let index = 0; index < configurations.length; index++) {
      const configure = configurations[index];
      // eslint-disable-next-line no-await-in-loop
      await addTimeSlots(configure);
    }
  },

  down: (queryInterface) => queryInterface.bulkDelete('time_slot_configurations', null, {}),
};
