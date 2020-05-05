var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');
// var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// =================================
// Obtener todos los usuarios
// =================================
// next cuando se ejecute continúe con la siguiente instrucción, se verá con los middleware
app.get('/', (request, response, next) => {

    // Usuario.find({}, (err, usuarios) => {
    //     if (err) {
    //         return response.status(500).json({
    //             ok: false,
    //             mensaje: 'Error cargando usuarios',
    //             errors: err
    //         });
    //     }

    //     response.status(200).json({
    //         ok: true,
    //         usuarios: usuarios
    //     });
    // });

    // segundo párametro del find indica que campos se desean mostrar
    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});

// SE MOVIÓ A AUTENTICACIÓN PARA HACERLO FLEXIBLE
// // =================================
// // Verificar token
// // =================================
// app.use('/', (request, response, next) => {
//     var token = request.query.token;
//     jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return response.status(401).json({
//                 ok: false,
//                 mensaje: 'Token incorrecto',
//                 errors: err
//             });
//         }

//         next(); // puede continuar con las funciones de abajo
//     });
// });

// =================================
// Actualizar usuario
// =================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });
});

// =================================
// Crear un nuevo usuario
// =================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: request.usuario
        });
    });
});

// =================================
// Borrar usuario por el id
// =================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;