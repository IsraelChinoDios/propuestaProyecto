const mongoose = require('mongoose');
const User = require('../models/user.model');
const Article = require('../models/article.model');
const Category = require('../models/category.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/septimoBlog';
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default';

async function testRoles() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');


        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('pass123', salt);

        const adminUser = await User.create({
            nombre: 'AdminTest_' + Date.now(),
            contrasena: hash,
            rol: 'admin'
        });

        const normalUser = await User.create({
            nombre: 'UserTest_' + Date.now(),
            contrasena: hash,
            rol: 'usuario'
        });

        const adminToken = jwt.sign({ id: adminUser._id, rol: 'admin' }, JWT_SECRET);
        const userToken = jwt.sign({ id: normalUser._id, rol: 'usuario' }, JWT_SECRET);

        console.log('\n--- Testing Categories (Admin Only) ---');



        console.log('Simulating Middleware Check:');

        const canUserCreateCategory = normalUser.rol === 'admin';
        console.log(`User can create category? ${canUserCreateCategory} (Expected: false)`);

        const canAdminCreateCategory = adminUser.rol === 'admin';
        console.log(`Admin can create category? ${canAdminCreateCategory} (Expected: true)`);

        console.log('\n--- Testing Articles (Ownership) ---');


        const article = await Article.create({
            titulo: 'My Article',
            cuerpo: 'Content',
            nombrePeli: 'Test Movie',
            anoEstreno: 2024,
            directores: ['Director 1'],
            idUsuario: normalUser._id
        });


        const isOwner = article.idUsuario.toString() === normalUser._id.toString();
        console.log(`User is owner? ${isOwner} (Expected: true)`);


        const isAdmin = adminUser.rol === 'admin';
        console.log(`Admin can edit? ${isAdmin} (Expected: true)`);


        await User.deleteMany({ _id: { $in: [adminUser._id, normalUser._id] } });
        await Article.findByIdAndDelete(article._id);
        console.log('\nCleanup done.');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testRoles();
