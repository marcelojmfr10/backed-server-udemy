var express = require('express');

var app = express();

// next cuando se ejecute continúe con la siguiente instrucción, se verá con los middleware
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

module.exports = app;