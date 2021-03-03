require('dotenv').config();

module.exports = {
  host: process.env.DB_HOST || '127.0.0.1',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  dialect: process.env.DB_CONNECTION,
};
