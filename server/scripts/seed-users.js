require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Article = require('../models/article.model');
const Review = require('../models/review.model');
const MovieReview = require('../models/movieReview.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/septimoBlog';

async function createUser(nombre, contrasena, data) {
  const existing = await User.findOne({ nombre });
  
  if (existing) {
    console.log(`Usuario "${nombre}" ya existe, omitiendo...`);
    return existing;
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(contrasena, salt);
  
  const user = await User.create({
    nombre,
    contrasena: hashedPassword,
    ...data,
    idArticulos: 0,
    idResenas: 0
  });
  
  console.log(`✓ Usuario "${nombre}" creado con rol: ${user.rol}`);
  return user;
}

async function createCategory(nombre, descripcion) {
  const existing = await Category.findOne({ nombre });
  
  if (existing) {
    console.log(`Categoría "${nombre}" ya existe, omitiendo...`);
    return existing;
  }
  
  const category = await Category.create({ nombre, descripcion });
  console.log(`✓ Categoría "${nombre}" creada`);
  return category;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Conectado a MongoDB, iniciando seed...\n');

    // ========================================
    // CATEGORÍAS
    // ========================================
    console.log('📁 Creando categorías...');
    
    const sciFiCategory = await createCategory('Ciencia Ficción', 'Películas de ciencia ficción, futurismo y tecnología');
    const terrorCategory = await createCategory('Terror', 'Películas de terror, horror y suspense');
    const dramaCategory = await createCategory('Drama', 'Películas dramáticas con profundidad emocional');
    const accionCategory = await createCategory('Acción', 'Películas de acción y aventura');
    const comediaCategory = await createCategory('Comedia', 'Películas cómicas y humor');
    const thrillerCategory = await createCategory('Thriller', 'Películas de suspenso e intriga');

    // ========================================
    // USUARIOS
    // ========================================
    console.log('\n👤 Creando usuarios...');
    
    const adminUser = await createUser('admin', 'admin123', {
      sobreMi: 'Administrador principal del sistema El Séptimo Blog.',
      generosFav: [dramaCategory._id, thrillerCategory._id],
      rol: 'admin',
      avatar: 'assets/Imagenes/El septimo blog white.png'
    });

    const normalUser = await createUser('usuario', 'usuario123', {
      sobreMi: 'Amante del cine.',
      generosFav: [terrorCategory._id, sciFiCategory._id],
      rol: 'usuario',
      avatar: 'assets/Imagenes/1.png'
    });

    console.log('\n✅ Seed completado exitosamente!\n');
    console.log('═══════════════════════════════════════════');
    console.log('📋 CREDENCIALES PARA INICIAR SESIÓN:');
    console.log('═══════════════════════════════════════════\n');
    console.log('👑 ADMINISTRADOR:');
    console.log('   Usuario:     admin');
    console.log('   Contraseña:  admin123\n');
    console.log('👤 USUARIO NORMAL:');
    console.log('   Usuario:     usuario');
    console.log('   Contraseña:  usuario123\n');
    console.log('═══════════════════════════════════════════');
    console.log('📊 DATOS CREADOS:');
    console.log('   - 2 usuarios (1 admin, 1 usuario)');
    console.log('   - 6 categorías');
    console.log('═══════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
