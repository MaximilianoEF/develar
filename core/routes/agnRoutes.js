/**
 * Load module dependencies
 */
var express = require('express');
var router = express.Router();
var servicio = require('../models/acervoModel.js');
const whoami = "Router:routes/agnRoutes: ";

/**
 * Efectuar la migración de la base de datos
 *    http://localhost:8080/api/vida/migrar
 *    La collección acervos debe estar en blanco
 *
 */
router.get('/migrar', function(req, res) {
    servicio.migrateDb(function(error) {
            res.status(400).json(error);
        },
        function(result) {
            res.status(200).json({ mensaje: 'Fijate en Mongo si migroó!' });
        });
});

router.get('/search', function(req, res) {
    servicio.findByQuery(req.query, function(error) {
            res.status(400).json(error)
        },
        function(resultados) {
            res.status(200).json(resultados);
        });
});

router.get('/acervo/:id', function(req, res) {
    servicio.findById(req.params.id, function(error) {
            res.status(400).json(error)
        },
        function(resultado) {
            res.status(200).json(resultado);
        });
});

router.get('/reviewdb/stringify', function(req, res) {
    servicio.rebuildStringify(function(error) {
        res.status(400).json(error);
    }, function(result) {
        res.status(200).json({ mensaje: 'REVIEW DB :: Stringify OK' });
    })
});

/**
 * Ruta: /api/vida/exportar
 * Método: GET
 * Descripción: exportar resultado de búsqueda a XLS
 *
 */
router.get('/exportar', function(req, res) {
    servicio.exportarResultado(req.query, req, res);

    // service.create(req.body, function(error) {
    //         res.status(400).json(error);
    //     },
    //     function(result) {
    //         res.status(201).json(result);
    //     });
});

module.exports = router;
