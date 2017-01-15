process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const config = require('../config').conf;

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

app.use((req, res, next) => {
  if(config.key.privateKey && config.key.certificate && !req.secure) {
    return res.redirect('https://' + req.headers.host + (config.sslPort ? ':' + config.sslPort : '') + req.url);
  } else {
    next();
  }
});

app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', path.resolve('./views'));

app.use('/libs', express.static(path.resolve('./libs')));
app.use('/public', express.static(path.resolve('./public')));

require('./api');
require('./jandan');

const version = require('../package').version;

app.get('/.well-known/acme-challenge/:id', (req, res) => {
  res.sendFile(req.params.id, {
    root: path.resolve(__dirname, '../../opensslkey/'),
  }, err => {
    if (err) {
      console.log(err);
      return res.status(404).end();
    }
  });
});

app.get('/serviceworker.js', (req, res) => {
  res.header('Content-Type', 'text/javascript');
  res.sendFile('serviceworker.js', {
    root: path.resolve(__dirname, '../public/'),
  }, err => {
    if (err) {
      console.log(err);
      return res.status(404).end();
    }
  });
});

app.get('*',
  (req, res) => {
    res.render('index', {
      version,
    });
  }
);

const https = require('https');
const http2 = require('spdy');
const http = require('http');

const options = {};
if(config.key.privateKey && config.key.certificate) {
  const fs = require('fs');
  options.key = fs.readFileSync(config.key.privateKey);
  options.cert = fs.readFileSync(config.key.certificate);
  http2.createServer(options, app).listen(config.sslPort ||443);
}

http.createServer(app).listen(config.port || 80);

console.log(`system start. version: ${ version }`);
