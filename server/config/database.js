require('dotenv').config();

module.exports = {
  development: {
    host: process.env.DB_HOST || '127.0.0.1',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    dialect: process.env.DB_CONNECTION,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  },
  local: {
    host: '127.0.0.1',
    username: 'postgres',
    password: 'postgres',
    database: 'blog-test',
    port: '5432',
    dialect: process.env.DB_CONNECTION,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  },
  production: {
    host: process.env.DB_HOST || '127.0.0.1',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    dialect: process.env.DB_CONNECTION,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  },
};
