const router = require('express').Router();
const User = require('../models/user.model');
const Review = require('../models/review.model');

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
