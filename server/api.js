const app = require('./express').app;
const knex = require('./db').knex;

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

app.post('/api/login');
app.post('/api/image');
app.delete('/api/image/:id');
