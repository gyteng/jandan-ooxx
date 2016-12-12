const app = require('./express').app;

app.get('/api/image');
app.get('/api/image/:id');

app.post('/api/login');
app.post('/api/image');
app.delete('/api/image/:id');
