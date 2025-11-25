const { Schema, model } = require('mongoose');

const MovieReviewSchema = new Schema(
  {
    nombrePeli: {
      type: String,
      required: true,
      trim: true
    },
    ano: {
      type: Number,
      required: true
    },
    sinopsis: String,
    calificacionGeneral: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    director: String,
    escritor: String,
    actores: [String],
    genero: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    poster: {
      type: String,
      required: true
    },
    resenas: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = model('MovieReview', MovieReviewSchema);
