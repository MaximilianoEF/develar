const express = require('express');
const router = express.Router();
const service = require('../models/agnUsuarioWebModel.js');
const passport = require('passport');
const whoami = 'Router : routes / agnUserLogginRouter';

/**
 * Ruta: /api/usuariosloggin/login
 * Método: POST
 * Descripción: inicia una sesión
 *
 */
router.post('/login', function(req, res, next) {
    passport.authenticate('agnweb-local', function(err, user, info) {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(400).json({
                error: {
                    message: 'Error en la autenticacion',
                    status: 400
                }
            });
        }

        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            service.recalcularEdad(user);
            return res.status(200).json(user);
        });
    })(req, res, next);
});

/**
 * Ruta: /api/usuariosloggin/resetpassword
 * Método: POST
 * Descripción: edita la contraseña
 *
 */
router.post('/resetpassword', function(req, res) {
    service.resetPassword(req.body, function(error) {
            res.status(400).json(error);
        },
        function(result) {
            res.status(200).json(result);
        });
});

/**
 * Ruta: /api/usuariosloggin/logout
 * Método: GET
 * Descripción: cierra una sesión
 *
 */
router.get('/logout', function(req, res) {
    req.logOut();
    req.session = null;
    res.status(200).json({ message: 'Sesión finalizada OK' });
});


/**
 * Ruta: /api/usuariosloggin
 * Método: POST
 * Descripción: crear un nuevo usuario
 *
 */
router.post('/', function(req, res) {
    service.create(req.body, function(error) {
            res.status(400).json(error);
        },
        function(result) {
            res.status(201).json(result);
        });
});


module.exports = router;
