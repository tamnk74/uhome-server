import Sequelize from 'sequelize';
import { dbConfig as config } from '../config';

const DAO = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  dialectOptions:
    config.dialect === 'postgres'
      ? {
          ssl: { rejectUnauthorized: false },
        }
      : {
          decimalNumbers: true,
        },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: console.log,
});

module.exports = DAO;
