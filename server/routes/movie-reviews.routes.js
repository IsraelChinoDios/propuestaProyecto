const router = require('express').Router();
const MovieReview = require('../models/movieReview.model');
const Review = require('../models/review.model');
const User = require('../models/user.model');
const verifyToken = require('../middleware/auth.middleware');

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

router.get('/', async (_req, res, next) => {
  try {
    const movies = await MovieReview.find()
      .populate('genero', 'nombre descripcion')
      .sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const movie = await MovieReview.findById(req.params.id)
      .populate('genero', 'nombre descripcion')
      .populate({
        path: 'resenas',
        populate: { path: 'idUsuario', select: 'nombre' }
      });
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    res.json(movie);
  } catch (error) {
    next(error);
  }
});

// POST a new review for a movie and update movie's average score
router.post('/:id/reviews', async (req, res, next) => {
  try {
    const movie = await MovieReview.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    const { idUsuario, resena, calificacion } = req.body;
    if (!idUsuario || !resena || calificacion === undefined) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: idUsuario, resena, calificacion' });
    }

    // ensure user exists (optional, but helps keep data integrity)
    const user = await User.findById(idUsuario);
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const newReview = await Review.create({ idUsuario, resena, calificacion: Number(calificacion) });
    movie.resenas = movie.resenas || [];
    movie.resenas.push(newReview._id);

    // Populate the in-memory movie's reviews (includes the newly pushed id)
    await movie.populate({ path: 'resenas' });
    const allReviews = movie.resenas || [];

    // Calculate average from populated review documents
    const sum = allReviews.reduce((s, r) => s + (r.calificacion ?? 0), 0);
    const avg = allReviews.length ? sum / allReviews.length : 0;

    // Update and save movie once
    movie.calificacionGeneral = avg;
    await movie.save();

    res.status(201).json({ review: newReview, movie });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.poster) {
      return res.status(400).json({ message: 'El póster es obligatorio.' });
    }
    if (payload.ano) payload.ano = Number(payload.ano);
    if (payload.calificacionGeneral !== undefined) {
      payload.calificacionGeneral = Number(payload.calificacionGeneral);
    }
    payload.actores = normalizeList(payload.actores);

    const movie = await MovieReview.create(payload);
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    
    if (payload.ano) payload.ano = Number(payload.ano);
    if (payload.calificacionGeneral !== undefined) {
      payload.calificacionGeneral = Number(payload.calificacionGeneral);
    }
    if (payload.actores) {
      payload.actores = normalizeList(payload.actores);
    }
    
    const movie = await MovieReview.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });
    
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    
    res.json(movie);
  } catch (error) {
    next(error);
  }
});

// UPDATE a specific review and recalculate movie average
router.patch('/:movieId/reviews/:reviewId', verifyToken, async (req, res, next) => {
  try {
    const { movieId, reviewId } = req.params;
    const { resena, calificacion } = req.body;

    if (!resena && calificacion === undefined) {
      return res.status(400).json({ message: 'Se requiere al menos resena o calificacion para actualizar' });
    }

    const updateData = {};
    if (resena !== undefined) updateData.resena = resena;
    if (calificacion !== undefined) updateData.calificacion = Number(calificacion);

    const review = await Review.findByIdAndUpdate(reviewId, updateData, {
      new: true,
      runValidators: true
    });

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Recalculate movie average
    const movie = await MovieReview.findById(movieId).populate('resenas');
    if (movie && movie.resenas.length > 0) {
      const sum = movie.resenas.reduce((s, r) => s + (r.calificacion ?? 0), 0);
      movie.calificacionGeneral = sum / movie.resenas.length;
      await movie.save();
    }

    res.json({ review, movie });
  } catch (error) {
    next(error);
  }
});

// DELETE a specific review from a movie and recalculate average
router.delete('/:movieId/reviews/:reviewId', verifyToken, async (req, res, next) => {
  try {
    const { movieId, reviewId } = req.params;
    const movie = await MovieReview.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    // Remove review ID from movie's resenas array
    movie.resenas = movie.resenas.filter((id) => id.toString() !== reviewId);

    // Delete the review document
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Recalculate average rating
    if (movie.resenas.length > 0) {
      await movie.populate('resenas');
      const sum = movie.resenas.reduce((s, r) => s + (r.calificacion ?? 0), 0);
      movie.calificacionGeneral = sum / movie.resenas.length;
    } else {
      movie.calificacionGeneral = 0;
    }

    await movie.save();
    res.json({ message: 'Reseña eliminada correctamente', review: deletedReview, movie });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const movie = await MovieReview.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    // Delete associated reviews
    if (movie.resenas && movie.resenas.length > 0) {
      await Review.deleteMany({ _id: { $in: movie.resenas } });
    }
    res.json({ message: 'Película eliminada correctamente', movie });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
