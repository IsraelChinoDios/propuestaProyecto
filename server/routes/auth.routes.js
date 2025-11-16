const router = require('express').Router();
const User = require('../models/user.model');

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.contrasena;
  return user;
};

router.post('/login', async (req, res, next) => {
  try {
    const { nombre, contrasena } = req.body;
    if (!nombre || !contrasena) {
      return res.status(400).json({ message: 'Nombre y contraseña son requeridos.' });
    }

    const user = await User.findOne({ nombre });
    if (!user || user.contrasena !== contrasena) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { nombre, contrasena, generosFav = [], sobreMi } = req.body;
    if (!nombre || !contrasena) {
      return res.status(400).json({ message: 'Nombre y contraseña son requeridos.' });
    }

    const exists = await User.findOne({ nombre });
    if (exists) {
      return res.status(409).json({ message: 'Ese nombre ya está registrado.' });
    }

    const user = await User.create({
      nombre,
      contrasena,
      generosFav,
      sobreMi,
      rol: 'usuario'
    });

    res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
