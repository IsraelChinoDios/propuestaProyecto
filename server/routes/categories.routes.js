const router = require('express').Router();
const Category = require('../models/category.model');
const verifyToken = require('../middleware/auth.middleware');
const verifyAdmin = require('../middleware/admin.middleware');

router.get('/', async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ nombre: 1 });
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        next(error);
    }
});

router.post('/', verifyToken, verifyAdmin, async (req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido.' });
        }

        const exists = await Category.findOne({ nombre });
        if (exists) {
            return res.status(409).json({ message: 'La categoría ya existe.' });
        }

        const category = await Category.create({ nombre, descripcion });
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', verifyToken, verifyAdmin, async (req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { nombre, descripcion },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
