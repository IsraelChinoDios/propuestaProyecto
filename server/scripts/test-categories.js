const mongoose = require('mongoose');
const Category = require('../models/category.model');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/septimoBlog';

async function testCategories() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const testCategory = {
            nombre: 'TestCategory_' + Date.now(),
            descripcion: 'This is a test category'
        };

        console.log('1. Testing Create...');
        const created = await Category.create(testCategory);
        console.log('Created:', created.nombre);

        console.log('2. Testing Read (All)...');
        const all = await Category.find();
        console.log('Total categories:', all.length);

        console.log('3. Testing Update...');
        const updated = await Category.findByIdAndUpdate(
            created._id,
            { descripcion: 'Updated description' },
            { new: true }
        );
        console.log('Updated description:', updated.descripcion);

        console.log('4. Testing Delete...');
        await Category.findByIdAndDelete(created._id);
        const deleted = await Category.findById(created._id);
        console.log('Deleted successfully:', deleted === null ? 'YES' : 'NO');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testCategories();
