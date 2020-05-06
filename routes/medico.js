var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');
// var SEED = require('../config/config').SEED;

var app = express();
var Medico = require('../models/medico');

// =================================
// Obtener todos los médicos
// =================================
// next cuando se ejecute continúe con la siguiente instrucción, se verá con los middleware
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    // segundo párametro del find indica que campos se desean mostrar
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médico',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                response.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            })


        });
});

// =================================
// Actualizar médico
// =================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = request.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });
});

// =================================
// Crear un nuevo médico
// =================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: request.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// =================================
// Borrar un médico por el id
// =================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con ese id',
                errors: { message: 'No existe un médico con ese id' }
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;