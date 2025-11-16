const { Schema, model } = require('mongoose');

const ReviewSchema = new Schema(
  {
    idUsuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fechaPublicacion: {
      type: Date,
      default: Date.now
    },
    resena: {
      type: String,
      required: true
    },
    calificacion: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = model('Review', ReviewSchema);
