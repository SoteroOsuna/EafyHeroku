const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String
    },
    email: {
        type: String
    },
    contraseña: {
        type: String
    }
})

module.exports = mongoose.model('usuarios', usuarioSchema)