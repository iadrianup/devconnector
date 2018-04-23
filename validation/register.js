const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
	let errors = {};

	data.name = !isEmpty(data.name) ? data.name : '';
	data.email = !isEmpty(data.email) ? data.email : '';
	data.password = !isEmpty(data.password) ? data.password : '';
	data.password2 = !isEmpty(data.password2) ? data.password2 : '';

	if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
		errors.name = 'El nombre tiene que contener entre 2 y 30 caracteres.';
	}

	if (Validator.isEmpty(data.name)) {
		errors.name = 'El campo nombre es obligatorio.';
	}

	if (Validator.isEmpty(data.email)) {
		errors.email = 'El campo correo electrónico es obligatorio.';
	}

	if (!Validator.isEmail(data.email)) {
		errors.email = 'El correo electrónico es inválido.';
	}

	if (Validator.isEmpty(data.password)) {
		errors.password = 'El campo contraseña es obligatorio.';
	}

	if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
		errors.password = 'La contraseña debe contener al menos 6 caracteres.';
	}

	if (Validator.isEmpty(data.password2)) {
		errors.password2 = 'El campo confirmar contraseña es obligatorio.';
	}

	if (!Validator.equals(data.password, data.password2)) {
		errors.password2 = 'Las contraseñas no coinciden.';
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};
