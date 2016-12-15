const app = require('./express').app;
const knex = require('./db').knex;
const password = require('../config').conf.password;

const isLogin = (req, res, next) => {
  if(req.session.isLogin) {
    return next();
  }
  res.status(401).end();
};

app.get('/api/image', (req, res) => {
  const number = req.query.number || 1;
  return knex('images').select(['id', 'url']).orderByRaw('RANDOM()').limit(number).where({
    status: 0,
  }).then(success => {
    res.send(success);
  }).catch(() => {
    res.status(500).end();
  });
});

app.get('/api/image/:id', (req, res) => {
  const id = req.params.id;
  return knex('images').select(['id', 'url']).where({
    id,
    status: 0,
  }).then(success => {
    if(success.length) {
      return res.send(success[0]);
    }
    res.status(404).end();
  }).catch(() => {
    res.status(500).end();
  });
});

app.get('/api/login', (req, res) => {
  return res.send({isLogin: !!req.session.isLogin});
});

app.post('/api/login', (req, res) => {
  const pwd = req.body.password;
  delete req.session.isLogin;
  if(pwd === password) {
    req.session.isLogin = true;
    res.send('success');
    return;
  }
  res.status(401).end();
});

app.post('/api/logout', (req, res) => {
  delete req.session.isLogin;
  res.send('success');
});

app.post('/api/image/view', (req, res) => {
  const id = req.body.id;
  console.log(`${ req.ip } [ ${ id } ]`);
  res.send();
  id.forEach(f => {
    knex('view').insert({
      imageId: f,
      ip: req.ip,
      create: Date.now(),
    }).then().catch();
  });
});

app.delete('/api/image/:id', isLogin, (req, res) => {
  const id = req.params.id;
  knex('images').update({ status: -1 }).where({ id }).then(success => {
    req.send('success');
  }).catch(() => {
    res.status(500).end();
  });
});
