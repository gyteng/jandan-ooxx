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

const knex = require('./db').knex;

app.get('/image/:id', (req, res) => {
  const id = req.params.id;
  knex('images').select(['id', 'url']).where({ id }).then(success => {
    if(success.length) {
      return res.send(success[0]);
    }
    return res.status(404).end();
  });
});

const version = require('../package').version;

app.get('*',
  (req, res) => {
    res.render('index', {
      version,
    });
  }
);

app.listen(56000, '0.0.0.0', () => {
  console.log('system start.');
});
