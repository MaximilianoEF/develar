var express = require('express');
var router = express.Router();
var service = require('../models/tesauroModel.js');
const whoami = 'Router : routes / tesauroRoutes.js';

/**
 * Ruta : /api/tesauro
 * Método: GET
 * descripción: Recuperar todos
 */
router.get('/', function (req, res) {
    service.findAll(function(err) {
        res.status(400).json(err);

    }, function(entities) {
        res.status(200).json(entities);

    });
});




/**
 * Ruta: /api/tesauro/search
 * Método: GET
 * Descripción: recuperar tesauro según criterio
 *
 */
router.get('/search', function(req, res) {
    console.log('findByQuery query -> %o', req.query);

    service.findByQuery(req.query, function(error) {
        res.status(400).json(error);
    }, function(results) {
        res.status(200).json(results);
    });
});

/**
 * Ruta: /api/tesauro
 * Método: POST
 * Descripción: alta de nueva búsqueda
 *
 */
router.post('', function(req, res) {
    service.create(req.body, function(error) {
            res.status(400).json(error);
        },
        function(result) {
            res.status(201).json(result);
        });
});

module.exports = router;