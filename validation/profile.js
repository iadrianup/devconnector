const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data) {
  let errors = {};

	data.handle = !isEmpty(data.handle) ? data.handle : '';
	data.status = !isEmpty(data.status) ? data.status : '';
  data.skills = !isEmpty(data.skills) ? data.skills : '';

	if(!Validator.isLength(data.handle, { min: 2, max: 40 })) {
    errors.handle = 'El campo handle debe tener entre 2 y 40 caracteres.';
  }

  if(Validator.isEmpty(data.handle)) {
    errors.handle = 'El campo handle es obligatorio.';
  }

  if(Validator.isEmpty(data.status)) {
    errors.status = 'El campo estatus es obligatorio.';
  }

  if(Validator.isEmpty(data.skills)) {
    errors.skills = 'El campo habilidades es obligatorio.';
  }

  if(!isEmpty(data.website)) {
    if(!Validator.isURL(data.website)) {
      errors.website = 'No es una URL válida.';
    }
  }

  if(!isEmpty(data.youtube)) {
    if(!Validator.isURL(data.youtube)) {
      errors.youtube = 'No es una URL válida.';
    }
  }

  if(!isEmpty(data.twitter)) {
    if(!Validator.isURL(data.twitter)) {
      errors.twitter = 'No es una URL válida.';
    }
  }

  if(!isEmpty(data.facebook)) {
    if(!Validator.isURL(data.facebook)) {
      errors.facebook = 'No es una URL válida.';
    }
  }

  if(!isEmpty(data.linkedin)) {
    if(!Validator.isURL(data.linkedin)) {
      errors.linkedin = 'No es una URL válida.';
    }
  }

  if(!isEmpty(data.instagram)) {
    if(!Validator.isURL(data.instagram)) {
      errors.instagram = 'No es una URL válida.';
    }
  }

	return {
		errors,
		isValid: isEmpty(errors)
	};
};
