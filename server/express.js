process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const port = require('../config').conf.port;

const compression = require('compression');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();

exports.app = app;

app.use(bodyParser.json());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));

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
