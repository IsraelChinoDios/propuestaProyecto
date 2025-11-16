const router = require('express').Router();
const Article = require('../models/article.model');

const normalizeDirectores = (directores) => {
  if (!directores) {
    return [];
  }
  if (Array.isArray(directores)) {
    return directores.map((dir) => dir?.trim()).filter(Boolean);
  }
  return String(directores)
    .split(',')
    .map((dir) => dir.trim())
    .filter(Boolean);
};

const buildPayload = (body = {}) => {
  const payload = { ...body };
  if (payload.directores !== undefined) {
    payload.directores = normalizeDirectores(payload.directores);
  }
  if (payload.anoEstreno !== undefined) {
    payload.anoEstreno = Number(payload.anoEstreno);
  }
  if (payload.fechaPublicacion) {
    payload.fechaPublicacion = new Date(payload.fechaPublicacion);
  }
  ['img1', 'img2', 'img3'].forEach((field) => {
    if (payload[field] === 'undefined' || payload[field] === undefined) {
      delete payload[field];
    }
  });
  return payload;
};

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.idUsuario = req.query.userId;
    }
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const articlesQuery = Article.find(filter)
      .sort({ fechaPublicacion: -1, createdAt: -1 })
      .populate('idUsuario', 'nombre');
    if (limit) {
      articlesQuery.limit(limit);
    }
    const articles = await articlesQuery;
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate('idUsuario', 'nombre');
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const article = await Article.create(buildPayload(req.body));
    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, buildPayload(req.body), {
      new: true,
      runValidators: true
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
