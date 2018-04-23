const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Cargar validacion de inputs
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Carga Modelo User
const User = require('../../models/User');

// @route  GET api/users/test
// @desc   Tests users route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'Users works' }));

// @route  GET api/users/register
// @desc   Registra a un usuario
// @access Public
router.post('/register', (req, res) => {
	const { errors, isValid } = validateRegisterInput(req.body);

	// Si no es valido
	if (!isValid) {
		return res.status(400).json(errors);
	}

	User.findOne({ email: req.body.email }).then(user => {
		if (user) {
			errors.email = 'El correo electrónico ya existe.';
			return res.status(400).json(errors);
		} else {
			const avatar = gravatar.url(req.body.email, {
				s: '200', // Size
				r: 'pg', // Raiting
				d: 'mm' // Default
			});

			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				avatar,
				password: req.body.password
			});

			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) throw err;
					newUser.password = hash;
					newUser
						.save()
						.then(user => res.json(user))
						.catch(err => console.log(err));
				});
			});
		}
	});
});

// @route  GET api/users/login
// @desc   Login de usuario / Regresa token JWT (Json web token) de acceso
// @access Public
router.post('/login', (req, res) => {
	const { errors, isValid } = validateLoginInput(req.body);

	// Si no es valido
	if (!isValid) {
		return res.status(400).json(errors);
	}

	const email = req.body.email;
	const password = req.body.password;

	// Encuentra al usuario por su email
	User.findOne({ email }).then(user => {
		// Si no se encontro el usuario
		if (!user) {
			errors.email = 'Usuario no encontrado';
			return res.status(404).json(errors);
		}

		// Verificar la contrasena de texto plano con la encriptada almacenada en la BD
		bcrypt.compare(password, user.password).then(isMatch => {
			// Si las contrasenas coinciden
			if (isMatch) {
				//res.json({ msg: 'Success' });

				// Usuario encontrado y contrasena correcta
				// Se crea el payload de JWT
				const payload = { id: user.id, name: user.name, avatar: user.avatar };

				// Firmar / Crear el token JWT
				jwt.sign(
					payload,
					keys.secretOrKey,
					{ expiresIn: 3600 },
					(err, token) => {
						res.json({
							success: true,
							token: 'Bearer ' + token
						});
					}
				);
			} else {
				errors.password = 'La contraseña es incorrecta.';
				return res.status(400).json(errors);
			}
		});
	});
});

// @route  GET api/users/current
// @desc   Regresa el usuario presente intentando logear
// (Recibe un token Bearer en el Header del Request y responde un objeto con la info del usuarui. Utiliza Passport para la autenticacion.)
// @access Public
router.get(
	'/current',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		res.json({
			id: req.user.id,
			name: req.user.name,
			email: req.user.email
		});
	}
);

module.exports = router;
