var express = require('express');

var app = express();
const path = require('path');
const fs = require('fs');

// next cuando se ejecute continúe con la siguiente instrucción, se verá con los middleware
app.get('/:tipo/:img', (request, response, next) => {
    var tipo = request.params.tipo;
    var img = request.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        response.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        response.sendFile(pathNoImage);
    }

    // response.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada correctamente'
    // });
});

module.exports = app;