process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const port = require('../config').conf.port;
const knex = require('./db').knex;

const compression = require('compression');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const store = new KnexSessionStore({ knex });
const path = require('path');
const app = express();

exports.app = app;

app.use(bodyParser.json());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: '7Ecb9F220a6',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 5 * 24 * 60 * 60 * 1000 },
  store,
}));

app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', path.resolve('./views'));

app.use('/libs', express.static(path.resolve('./libs')));
app.use('/public', express.static(path.resolve('./public')));

require('./api');
require('./jandan');

const version = require('../package').version;

app.get('*',
  (req, res) => {
    res.render('index', {
      version,
    });
  }
);

app.listen(port, '0.0.0.0', () => {
  console.log('system start.');
});
