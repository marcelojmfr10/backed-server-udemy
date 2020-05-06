var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');
// var SEED = require('../config/config').SEED;

var app = express();
var Hospital = require('../models/hospital');

// =================================
// Obtener todos los hospitales
// =================================
// next cuando se ejecute continúe con la siguiente instrucción, se verá con los middleware
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    // segundo párametro del find indica que campos se desean mostrar
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                response.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            })

        });
});

// =================================
// Actualizar hospital
// =================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });
});

// =================================
// Crear un nuevo hospital
// =================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: request.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// =================================
// Borrar un hospital por el id
// =================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;