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
  return knex('images').select(['id', 'url']).orderByRaw('RANDOM()').limit(number)
  .where('status', '>=', 0)
  .where('id', '>', 0)
  .then(success => {
    res.send(success);
  }).catch(() => {
    res.status(500).end();
  });
});

app.get('/api/image/week', (req, res) => {
  const number = req.query.number || 1;
  knex('favorite').count('images.id AS number').select(['images.id', 'images.url', 'favorite.create'])
  .innerJoin('images', 'images.id', 'favorite.imageId')
  .where('favorite.create', '>=', Date.now() - 7 * 24 * 3600 * 1000)
  .limit(number)
  .groupBy('images.id')
  .orderBy('number', 'desc')
  .orderBy('favorite.create', 'desc')
  .then(success => {
    res.send(success.map(m => {
      return {
        id: m.id,
        url: m.url,
      };
    }));
  }).catch(() => {
    res.status(500).end();
  });
});

app.get('/api/image/:id', (req, res) => {
  const id = req.params.id;
  return knex('images').select(['id', 'url'])
  .where({ id })
  .where('status', '>=', 0)
  .where('id', '>', 0)
  .then(success => {
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
  res.send();
  id.forEach(f => {
    knex('view').insert({
      imageId: f,
      ip: req.ip,
      session: req.session.id,
      create: Date.now(),
    }).then().catch();
  });
});

app.post('/api/image/favorite', (req, res) => {
  const id = req.body.id;
  res.send();
  knex('favorite').insert({
    imageId: id,
    ip: req.ip,
    session: req.session.id,
    create: Date.now(),
  }).then().catch();
});

app.put('/api/image/:id', isLogin, (req, res) => {
  const id = req.params.id;
  const status = +req.body.status;
  knex('images').update({
    status,
    create: Date.now(),
   }).where({ id }).then(success => {
    res.send('success');
  }).catch((err) => {
    res.status(500).end();
  });
});
