const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Middleware de Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuracion de la BD
const db = require('./config/keys').mongoURI;

// Conectar a MongoDB utilizando mongoose
mongoose
	.connect(db)
	.then(() => console.log('Conectado a MongoDB'))
	.catch(err => console.log(err));

// Middleware de Passport
app.use(passport.initialize());

// Configuracion de Passport
require('./config/passport')(passport);

// Uso de rutas
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));
