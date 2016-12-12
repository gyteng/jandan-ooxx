const app = require('./express').app;

app.get('/api/image');
app.get('/api/image/:id');
app.post('/api/login');
app.delete('/api/image/:id');
