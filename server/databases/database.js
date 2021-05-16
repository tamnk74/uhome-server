import Sequelize from 'sequelize';
import { dbConfig as config, debug } from '../config';

const DAO = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  dialectOptions:
    config.dialect === 'postgres'
      ? {
          ssl: { rejectUnauthorized: false },
        }
      : undefined,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: debug,
});

module.exports = DAO;
