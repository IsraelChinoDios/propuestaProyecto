const { Schema, model } = require('mongoose');

const ArticleSchema = new Schema(
  {
    fechaPublicacion: {
      type: Date,
      default: Date.now
    },
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    nombrePeli: {
      type: String,
      required: true,
      trim: true
    },
    anoEstreno: {
      type: Number,
      required: true
    },
    directores: [
      {
        type: String,
        trim: true
      }
    ],
    cuerpo: {
      type: String,
      required: true
    },
    img1: String,
    img2: String,
    img3: String,
    idUsuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = model('Article', ArticleSchema);
