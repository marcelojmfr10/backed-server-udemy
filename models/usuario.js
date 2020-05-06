var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

// var Schema = mongoose.Schema(); // la respuesta que me dieron es que no van los últimos paréntesis
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

// {PATH} para indicar varios campos si son únicos
usuarioSchema.plugin(uniqueValidator, { message: 'El correo debe de ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);