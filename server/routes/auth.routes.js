const router = require('express').Router();
const User = require('../models/user.model');

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.contrasena;
  return user;
};

router.post('/login', async (req, res, next) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    if ((!nombre && !correo) || !contrasena) {
      return res.status(400).json({ message: 'Identificador (nombre o correo) y contraseña son requeridos.' });
    }

    let user;
    if (correo) {
      user = await User.findOne({ correo });
    } else {
      user = await User.findOne({ nombre });
    }

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
    const { nombre, correo, contrasena, generosFav = [], sobreMi, rol } = req.body;
    if (!nombre || !contrasena) {
      return res.status(400).json({ message: 'Nombre y contraseña son requeridos.' });
    }

    const exists = await User.findOne({ nombre });
    if (exists) {
      return res.status(409).json({ message: 'Ese nombre ya está registrado.' });
    }

    const userRol = rol && (rol === 'admin' || rol === 'usuario') ? rol : 'usuario';

    const user = await User.create({
      nombre,
      correo: correo || '',
      contrasena,
      generosFav,
      sobreMi,
      rol: userRol
    });

    res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
