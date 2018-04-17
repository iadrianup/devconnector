const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Configuracion de la BD
const db = require('./config/keys').mongoURI;

// Conectar a MongoDB utilizando mongoose
mongoose
  .connect(db)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World!'));

// Uso de rutas
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));
