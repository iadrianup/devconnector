const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
	let errors = {};

	data.email = !isEmpty(data.email) ? data.email : '';
	data.password = !isEmpty(data.password) ? data.password : '';

	if (!Validator.isEmail(data.email)) {
		errors.email = 'El correo electrónico es inválido.';
	}

	if (Validator.isEmpty(data.email)) {
		errors.email = 'El campo correo electrónico es obligatorio.';
	}

	if (Validator.isEmpty(data.password)) {
		errors.password = 'El campo contraseña es obligatorio.';
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};
