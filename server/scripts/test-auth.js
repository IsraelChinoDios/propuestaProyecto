const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/septimoBlog';

async function testAuth() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const testUser = {
            nombre: 'TestUser_' + Date.now(),
            correo: `test_${Date.now()}@example.com`,
            contrasena: 'password123',
            rol: 'usuario'
        };

        console.log('1. Testing Registration...');
        // Simulate registration logic
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testUser.contrasena, salt);

        const user = await User.create({
            ...testUser,
            contrasena: hashedPassword
        });
        console.log('User registered successfully:', user.nombre);
        console.log('Password hashed in DB:', user.contrasena);

        console.log('2. Testing Login...');
        // Simulate login logic
        const foundUser = await User.findOne({ nombre: testUser.nombre });
        const isMatch = await bcrypt.compare(testUser.contrasena, foundUser.contrasena);

        if (isMatch) {
            console.log('Password match: SUCCESS');
            const token = jwt.sign(
                { id: foundUser._id, rol: foundUser.rol },
                process.env.JWT_SECRET || 'secret_key_default',
                { expiresIn: '24h' }
            );
            console.log('Token generated:', token ? 'YES' : 'NO');

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
            console.log('Token verified. User ID:', decoded.id);
        } else {
            console.error('Password match: FAILED');
        }

        // Cleanup
        await User.findByIdAndDelete(user._id);
        console.log('Test user cleaned up');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testAuth();
