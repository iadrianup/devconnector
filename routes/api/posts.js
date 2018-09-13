const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Cargar modelos
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Cargar validaciones
const validatePostInput = require('../../validation/post');

// @route  GET api/posts/test
// @desc   Tests posts route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'Posts works.' }));

// @route  GET api/posts
// @desc   Obtiene todos los posts
// @access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'No hay un posts.' }));
});

// @route  GET api/posts/:id
// @desc   Obtiene un post
// @access Public
router.get('/:id', (req, res) => {
  Post.find(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: 'No hay un post con ese id.' })
    );
});

// @route  POST api/posts
// @desc   Crea un post
// @access Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Se hace la validacion
    const { errors, isValid } = validatePostInput(req.body);
    // Si no es valido
    if (!isValid) {
      // Regresar error con 400
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route  GET api/posts/:id
// @desc   Obtiene un post
// @access Public
router.get('/:id', (req, res) => {
  Post.find(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: 'No hay un post con ese id.' })
    );
});

// @route  POST api/posts/:id
// @desc   Elimina un post
// @access Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Verificar el dueño del post
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'Usuario no autorizado.' });
          }

          // Eliminar
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err =>
          res.status(404).json({ postnotfound: 'No se encontró el post.' })
        );
    });
  }
);

// @route  POST api/posts/like/:id
// @desc   Agrega un like a un post
// @access Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'Al usuario ya le gusta este post.' });
          }

          // Agregar like
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfound: 'No se encontró el post.' })
        );
    });
  }
);

// @route  POST api/posts/unlike/:id
// @desc   Agrega un like a un post
// @access Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'Este post no tiene tu like.' });
          }

          // Quitar like
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(removeIndex, 1);

          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfound: 'No se encontró el post.' })
        );
    });
  }
);

// @route  POST api/posts/comment/:id
// @desc   Agrega un comentario a un post
// @access Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Se hace la validacion
    const { errors, isValid } = validatePostInput(req.body);
    // Si no es valido
    if (!isValid) {
      // Regresar error con 400
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Agregar al array comments
        post.comments.unshift(newComment);

        post.save().then(post => res.json(post));
      })
      .cath(err =>
        res.status(400).json({ postnotfound: 'No se encontró el post.' })
      );
  }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Elimina un comentario de un post
// @access Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Verificar que el comentario exista
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'El comentario no existe.' });
        }

        // Eliminar comentario
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        post.comments.splice(removeIndex);

        post.save().then(post => res.json(post));
      })
      .catch(err =>
        res.status(400).json({ postnotfound: 'No se encontró el post.' })
      );
  }
);

module.exports = router;
