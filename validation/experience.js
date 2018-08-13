const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateExperienceInput(data) {
	let errors = {};

	data.title = !isEmpty(data.title) ? data.title : '';
	data.company = !isEmpty(data.company) ? data.company : '';
	data.from = !isEmpty(data.from) ? data.from : '';

	if (Validator.isEmpty(data.title)) {
		errors.title = 'El campo título es obligatorio.';
	}

	if (Validator.isEmpty(data.company)) {
		errors.company = 'El campo empresa es obligatorio.';
  }
  
  if (Validator.isEmpty(data.from)) {
		errors.from = 'El campo desde es obligatorio.';
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};
