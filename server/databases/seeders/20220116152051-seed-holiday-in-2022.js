const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const Holiday = require('../../models/holiday');

dayjs.extend(utc);
dayjs.extend(timezone);

const holidaysOf2022 = [
  {
    from: '2022-01-31',
    to: '2022-02-04',
  },
  {
    from: '2022-04-10',
    to: '2022-04-11',
  },
  {
    from: '2022-04-30',
    to: '2022-05-03',
  },
  {
    from: '2022-09-02',
    to: '2022-09-02',
  },
];

const upsert = (from, to) =>
  Holiday.findOrCreate({
    where: {
      from,
      to,
    },
    defaults: {
      id: uuidv4(),
      from,
      to,
    },
  });
const restore = (from, to) =>
  Holiday.destroy({
    where: {
      from,
      to,
    },
  });

module.exports = {
  up: async () => {
    const promises = holidaysOf2022.map((holiday) => {
      const from = dayjs.tz(holiday.from, 'Asia/Ho_Chi_Minh').utc().toISOString();
      const to = dayjs.tz(holiday.to, 'Asia/Ho_Chi_Minh').utc().toISOString();
      return upsert(from, to);
    });

    return Promise.all(promises);
  },

  down: () => {
    const promises = holidaysOf2022.map((holiday) => {
      const from = dayjs.tz(holiday.from, 'Asia/Ho_Chi_Minh').utc().toISOString();
      const to = dayjs.tz(holiday.to, 'Asia/Ho_Chi_Minh').utc().toISOString();
      return restore(from, to);
    });

    return Promise.all(promises);
  },
};
