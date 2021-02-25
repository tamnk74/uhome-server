import Express from 'express';
import Morgan from 'morgan';
import passport from 'passport';
import CORS from 'cors';
import BodyParser from 'body-parser';
import Compress from 'compression';
import Path from 'path';
import FileUpload from 'express-fileupload';
import { ApiRouter } from './routes';
import { env } from './config';
import { handleError } from './errors';
import { trimObject } from './helpers/Util';
import './config/passport';

// Set up the express app
const app = Express();

// Allow cors
app.use(CORS());

// Parse incoming requests data
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(Compress());

app.use(
  FileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  Express.static(Path.resolve(__dirname, 'server', 'public'), {
    maxAge: 31557600000,
  })
);

if (env === 'development') {
  app.use(
    Morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
    )
  );
}

// set path for static assets
app.use(Express.static(Path.resolve(__dirname, 'public')));

app.use((req, res, next) => {
  // Trim all request body data
  trimObject(req.body);
  next();
});

app.get('/health-check', (req, res) => res.status(200).send('ok'));
app.use('/api', ApiRouter);

/**
 * Error Handler.
 */

app.use(handleError);

module.exports = app;
