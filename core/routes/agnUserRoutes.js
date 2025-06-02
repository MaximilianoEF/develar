const express = require('express');
const router = express.Router();
const service = require('../models/agnUsuarioWebModel.js');
const whoami = 'Router : routes / agnUserRouter';
const middleware = require('../services/middleware');




/**
 * Ruta: /api/usuarios
 * Método: GET
 * Descripción: recuperar todos los usuarios
 *
 */
 router.get('/', middleware.isAdminUser, function(req, res) {
    service.findAll(function(error) {
        res.status(400).json(error);
    }, function(results) {
        res.status(200).json(results);
    });
});





/**
 * Ruta: /api/agn/usuarios/search
 * Método: GET
 * Descripción: recuperar usuarios que cumplan el criterio de búsqueda
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
 * Ruta: /api/usuarios/:id
 * Método: GET
 * Descripción: recupera un usuario por ID
 *
 */
router.get('/:id', function(req, res) {
    service.findById(req.params.id, function(error, result) {
        if (error) {
            res.status(400).json(error);
        } else {
            res.status(200).json(result);
        }
    });
});

/**
 * Ruta: /api/usuarios/:id/persona
 * Método: GET
 * Descripción: recupera los datos de la persona asociada al usuario ID
 *
 */
router.get('/:id/persona', function(req, res) {
    service.findPersonForUser(req.params.id, function(error) {
        res.status(400).json(error);
    }, function(result) {
        res.status(200).json(result);
    });
});


/**
 * Ruta: /api/usuarios/:id
 * Método: PUT
 * Descripción: modificar un usuario
 *
 */
router.put('/:id', function(req, res) {
    service.update(req.params.id, req.body, function(error) {
        res.status(400).json(error);
    }, function(results) {
        res.status(200).json(results);
    });
});

/**
 * Ruta: /api/usuarios/:id
 * Método: DELETE
 * Descripción: eliminar un usuario
 *
 */
router.delete('/:id', function(req, res) {
    service.delete(req.params.id, function(error) {
        res.status(400).json(error);
    }, function(result) {
        res.status(200).json(result);
    });
});


module.exports = router;