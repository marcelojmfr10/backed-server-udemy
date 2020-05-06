var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ==============================
// Búsqueda por colección
// ==============================
app.get('/coleccion/:tabla/:busqueda', (request, response) => {
    var busqueda = request.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var tabla = request.params.tabla;

    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex)
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex)
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex)
            break;
        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda sólo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            });
    }

    promesa.then(data => {
        response.status(200).json({
            ok: true,
            [tabla]: data // no es la palabra tabla sino el resultado por eso [] ECMAScript 6, le llama propiedades de objeto computadas o procesadas
        });
    })
});

// ==============================
// Búsqueda general
// ==============================
// next cuando se ejecute continúe con la siguiente instrucción, se verá con los middleware
app.get('/todo/:busqueda', (request, response, next) => {
    var busqueda = request.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    // ejecutar arreglo de promesas
    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        response.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

    // buscarHospitales(busqueda, regex).then(hospitales => {
    //     response.status(200).json({
    //         ok: true,
    //         hospitales: hospitales
    //     });
    // })

    // hay que usar una expresión regular porque la palabra que enviemos la busca exactamente igual
    // /norte/i
    // Hospital.find({ nombre: regex }, (err, hospitales) => {
    //     response.status(200).json({
    //         ok: true,
    //         hospitales: hospitales
    //     });
    // });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email').exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales)
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar médicos', err);
                } else {
                    resolve(medicos)
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role').or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;