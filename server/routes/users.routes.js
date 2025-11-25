const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Review = require('../models/review.model');

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.contrasena;
  return user;
};

const normalizeGeneros = (generos) => {
  if (!generos) return [];

  // Helper to resolve to an ID string
  const toId = (g) => {
    if (!g) return undefined;
    if (typeof g === 'string') return g;
    if (typeof g === 'object' && g._id) return String(g._id);
    return undefined;
  };

  // Filter only valid Mongo ObjectId strings to avoid CastError
  const isValidId = (id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

  if (Array.isArray(generos)) {
    return generos
      .map(toId)
      .filter((id) => isValidId(id));
  }

  // Si es un string, intentar parsearlo como JSON o dividir por comas
  if (typeof generos === 'string') {
    try {
      const parsed = JSON.parse(generos);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return arr.map(toId).filter((id) => isValidId(id));
    } catch {
      return generos
        .split(',')
        .map((g) => g.trim())
        .map(toId)
        .filter((id) => isValidId(id));
    }
  }

  const id = toId(generos);
  return isValidId(id) ? [id] : [];
};

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-contrasena')
      .populate('generosFav', 'nombre descripcion');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get count of reviews by user
router.get('/:id/reviews-count', async (req, res, next) => {
  try {
    const count = await Review.countDocuments({ idUsuario: req.params.id });
    res.json({ count });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { sobreMi, generosFav, avatar, rol } = req.body;
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

    if (rol !== undefined) {
      if (rol !== 'admin' && rol !== 'usuario') {
        return res.status(400).json({ message: 'Rol inválido. Debe ser "admin" o "usuario".' });
      }
      payload.rol = rol;
    }

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: 'No hay campos para actualizar.' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    }).populate('generosFav', 'nombre descripcion');

    if (!updated) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ user: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // Delete associated reviews
    await Review.deleteMany({ idUsuario: req.params.id });
    res.json({ message: 'Usuario eliminado correctamente', user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
