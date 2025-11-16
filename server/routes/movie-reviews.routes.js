const router = require('express').Router();
const MovieReview = require('../models/movieReview.model');

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
    const movies = await MovieReview.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const movie = await MovieReview.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    res.json(movie);
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

module.exports = router;
