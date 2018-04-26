const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

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

// @route  POST api/profile
// @desc   Crea o edita un perfil de un usuario
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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

module.exports = router;
