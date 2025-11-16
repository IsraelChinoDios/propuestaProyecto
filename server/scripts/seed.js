require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/article.model');
const Review = require('../models/review.model');
const MovieReview = require('../models/movieReview.model');
const User = require('../models/user.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/septimoBlog';

async function upsertUser(nombre, data) {
  return User.findOneAndUpdate(
    { nombre },
    {
      $set: data,
      $setOnInsert: {
        idArticulos: data.idArticulos ?? 0,
        idResenas: data.idResenas ?? 0
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo, seeding data...');

  const adminUser = await upsertUser('Admin Septimo', {
    contrasena: 'admin123',
    sobreMi: 'Administrador del sistema de El Séptimo Blog.',
    generosFav: ['Drama', 'Thriller'],
    rol: 'admin',
    avatar: 'assets/Imagenes/El septimo blog white.png'
  });

  const regularUser = await upsertUser('ChinoJuegaGod', {
    contrasena: 'user123',
    sobreMi:
      'Apasionado por el cine desde que tengo memoria, mi amor por el séptimo arte comenzó con los clásicos de Hitchcock.',
    generosFav: ['Terror', 'Sci-Fi', 'Comedia'],
    rol: 'usuario',
    avatar: 'assets/Imagenes/1.png'
  });

  let article = await Article.findOne({ titulo: '¿Cuál es el arte de no contar nada?' });
  if (!article) {
    article = await Article.create({
      titulo: '¿Cuál es el arte de no contar nada?',
      nombrePeli: 'Fallen Leaves',
      anoEstreno: 2023,
      directores: ['Aki Kaurismäki'],
      cuerpo: 'Texto de ejemplo para el artículo.',
      img1: 'https://example.com/fallen_leaves.jpg',
      idUsuario: regularUser._id
    });
    await User.findByIdAndUpdate(regularUser._id, { $inc: { idArticulos: 1 } });
  }

  let review = await Review.findOne({ idUsuario: regularUser._id });
  if (!review) {
    review = await Review.create({
      idUsuario: regularUser._id,
      resena: 'Reseña de ejemplo para la película Alien.',
      calificacion: 8.5
    });
    await User.findByIdAndUpdate(regularUser._id, { $inc: { idResenas: 1 } });
  }

  let movieReview = await MovieReview.findOne({ nombrePeli: 'Alien' });
  if (!movieReview) {
    movieReview = await MovieReview.create({
      nombrePeli: 'Alien',
      ano: 1979,
      sinopsis:
        'La tripulación de la Nostromo responde una señal de socorro y descubre un organismo que amenaza su supervivencia.',
      calificacionGeneral: 8.2,
      director: 'Ridley Scott',
      escritor: 'Dan O’Bannon',
      actores: ['Sigourney Weaver', 'Tom Skerritt', 'John Hurt'],
      genero: 'Ciencia ficción',
      resenas: [review._id]
    });
  } else if (!movieReview.resenas.includes(review._id)) {
    movieReview.resenas.push(review._id);
    await movieReview.save();
  }

  console.log('Seeding completed.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
