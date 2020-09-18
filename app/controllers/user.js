require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const passwordValidator = require('../middleware/password-validator');
const jwt = require("jsonwebtoken");

/**
 * Permet la création des roles 'root' et 'admin' pour deux mail bien disctinct
 * TODO: En production permettre la configuration dans le fichier .env par exemple
 * @param {string} email
 * @return {string}
 */
const roles = (email) => {
  switch (email) {
      case 'root@local.dev':
          return 'root';
      case 'admin@local.dev':
          return 'admin';
      default:
          return 'user';
  }
};

// Création d'un nouvel utilisateur
exports.signup = (req, res) => {
    if (passwordValidator.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash,
                    role: roles(req.body.email)
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                    .catch(() => res.status(400).json({ message: 'Adresse e-mail existante'}));
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        res.status(400).json({ message: 'Le mot de passe doit contenir entre 8 et 30 caractères, comporter au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.'})
    }
};

exports.login = (req, res) => {
  User.findOne({ email: req.body.email})
      .then(user => {
          if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé !' });
          bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                  if (!valid) return res.status(401).json({ message : 'Mot de passe incorrect !' })
                  res.status(200).json({
                      userId: user._id,
                      token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '24H' })
                  });
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};
