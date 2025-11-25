const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET || 'secret_key_default',
      { expiresIn: '24h' }
    );

    res.json({ user: sanitizeUser(user), token });
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const user = await User.create({
      nombre,
      correo: correo || '',
      contrasena: hashedPassword,
      generosFav,
      sobreMi,
      rol: userRol
    });

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET || 'secret_key_default',
      { expiresIn: '24h' }
    );

    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
