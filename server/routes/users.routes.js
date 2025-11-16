const router = require('express').Router();
const User = require('../models/user.model');

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.contrasena;
  return user;
};

const normalizeGeneros = (generos) => {
  if (!generos) {
    return [];
  }
  if (Array.isArray(generos)) {
    return generos.map((g) => g?.trim()).filter(Boolean);
  }
  return String(generos)
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
};

router.patch('/:id', async (req, res, next) => {
  try {
    const { sobreMi, generosFav, avatar } = req.body;
    const payload = {};

    if (sobreMi !== undefined) {
      payload.sobreMi = sobreMi;
    }

    if (generosFav !== undefined) {
      payload.generosFav = normalizeGeneros(generosFav);
    }

    if (avatar !== undefined) {
      payload.avatar = avatar;
    }

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: 'No hay campos para actualizar.' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ user: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
