const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Se cargan las validaciones
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// Se carga el modelos Profile
const Profile = require('../../models/Profile');
// Se carga el modelo User
const User = require('../../models/User');

// @route  GET api/profile/test
// @desc   Tests profile route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'Profile works' }));

// @route  GET api/profile
// @desc   Tomar el perfil del usuario actual
// @access Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Se inicializa el objeto errors
    const errors = {};
    // Se busca el perfil
    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        // Si no se encontró perfil
        if (!profile) {
          // Se almacena el error en el objecto errors
          errors.noprofile = 'No existe un perfil para este usuario.';
          // Se regresa una respuesta http not found junto con el objecto errors
          return res.status(404).json(errors);
        }
        // Se responde con el perfil
        res.json(profile);
      })
      // Si algo sale mas se manda una respuesta http not found y un objecto con los errores
      .catch(err => res.status(404).json(err));
  }
);

// @route  GET api/profile/handle/:handle
// @desc   Obtiene un perfil por su handle
// @access Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'No existe perfil para este usuario.';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json({noprofile: 'No existe perfil para este usuario.'}));
});


// @route  GET api/profile/user/:user_id
// @desc   Obtiene un perfil por su user_id
// @access Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'No existe perfil para este usuario.';
        res.status(404).json(errors);
      }
      
      res.json(profile);
    })
    .catch(err => res.status(404).json({noprofile: 'No existe perfil para este usuario.'}));
});

// @route  GET api/profile/all/
// @desc   Obtiene los perfiles de todos los usuarios
// @access Public
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if(!profiles) {
        errors.noprofile = 'No hay perfiles.';
        return res.status(404).json(errors);
      }

      res.json(profiles)
    })
    .catch(err => res.status(404).json({ noprofiles: 'No hay perfiles.' }))
});

// @route  POST api/profile
// @desc   Crea o edita un perfil de un usuario
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Se hace la validacion
    const { errors, isValid } = validateProfileInput(req.body);
    // Si no es valido
    if(!isValid) {
      // Regresar error con 400
      return res.status(400).json(errors);
    }
    // Se toman los campos
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    // Se hace split a Skills para ponerlo en array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Verificar que el handle no exista
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            erros.handle = 'Ese handle ya existe.';
            res.status(400).json(errors);
          }

          // Guardar perfil
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route  POST api/profile/experience
// @desc   Agrega la experiencia de un perfil
// @access Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  
  // Se hace la validacion
  const { errors, isValid } = validateExperienceInput(req.body);
  // Si no es valido
  if(!isValid) {
    // Regresar error con 400
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      }

      // Agregar experiencia
      profile.experience.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    })
});

// @route  POST api/profile/education
// @desc   Agrega la educacion de un perfil
// @access Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  
  // Se hace la validacion
  const { errors, isValid } = validateEducationInput(req.body);
  // Si no es valido
  if(!isValid) {
    // Regresar error con 400
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      }

      // Agregar experiencia
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    })
});

// @route  DELETE api/profile/experience/:exp_id
// @desc   Elimina la experiencia de un perfil
// @access Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
 
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // Splice out an array
      profile.experience.splice(removeIndex, 1);

      // Guardar
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err))
});

// @route  DELETE api/profile/education/:edu_id
// @desc   Elimina la educacion de un perfil
// @access Private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      // Splice out an array
      profile.education.splice(removeIndex, 1);

      // Guardar
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err))
});

// @route  DELETE api/profile
// @desc   Elimina el usuario y perfil
// @access Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: req.user.id })
      .then(() => res.json({ success: true }))
    })
    .catch(err => res.status(404).json(err))
});

module.exports = router;
