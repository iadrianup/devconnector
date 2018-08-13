const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateEducationInput(data) {
	let errors = {};

	data.school = !isEmpty(data.school) ? data.school : '';
	data.degree = !isEmpty(data.degree) ? data.degree : '';
	data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
	data.from = !isEmpty(data.from) ? data.from : '';

	if (Validator.isEmpty(data.school)) {
		errors.school = 'El campo escuela es obligatorio.';
	}

	if (Validator.isEmpty(data.degree)) {
		errors.degree = 'El campo grado es obligatorio.';
  }
  
  if (Validator.isEmpty(data.fieldofstudy)) {
		errors.fieldofstudy = 'El campo campo de estudio es obligatorio.';
  }
  
  if (Validator.isEmpty(data.from)) {
		errors.from = 'El campo desde es obligatorio.';
  }
  
	return {
		errors,
		isValid: isEmpty(errors)
	};
};
