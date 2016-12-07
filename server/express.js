process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const path = require('path');
const app = express();

app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', path.resolve('./views'));

app.use('/libs', express.static(path.resolve('./libs')));
app.use('/public', express.static(path.resolve('./public')));

const getPicture = require('./jandan').getPicture;

app.get('/random', (req, res) => {
  getPicture().then(url => {
    res.send(url);
  }).catch(err => {
    res.status(404).end();
  });
});

app.get('*',
  (req, res) => {
    res.render('index');
  }
);

app.listen(56000, '0.0.0.0', () => {});
