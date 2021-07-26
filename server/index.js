require('babel-core/register');
require('babel-polyfill');

const Path = require('path');

global.__rootDir = Path.resolve(__dirname, '..');

const Http = require('http');
const { port, env } = require('./config');
const app = require('./app');

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */

const normalPort = normalizePort(port || '3000');
app.set('port', normalPort);

/**
 * Create HTTP server.
 */

const server = Http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address.port}`;
  console.log(`Listening on ${bind} ${env}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(normalPort);
server.on('error', onError);
server.on('listening', onListening);
