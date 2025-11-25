const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    sobreMi: String,
    generosFav: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    avatar: String,
    rol: {
      type: String,
      enum: ['admin', 'usuario'],
      default: 'usuario'
    },
    contrasena: {
      type: String,
      required: true
    },
    idArticulos: {
      type: Number,
      default: 0
    },
    idResenas: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);
