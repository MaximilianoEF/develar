/**
 * generación de PDF
 */


const express = require('express');
const router = express.Router();

const migraciones = require('../services/pdfmigraciones.js');

const whoami =  "Router:routes/zgenpdfRoutes.js: ";


/**
 * Construye el PDF con la solicitud de hisopado del afectado
 */
router.get('/constanciamigraciones', function (req, res) {
    migraciones.genConstanciaAntMigratorios(req, res);
});

router.get('/constanciamigraciones/:id', function (req, res) {
    migraciones.genConstanciaAntMigratorios(req, res);
});



router.get('/discover', function (req, res) {

    let apis = [
        {
            route: '/discover',
            description: 'service: pdfhisopado - generación de salidas en PDF'
        },
        {
            route: '/constanciamigraciones/:udaid',
            description: 'Constancia de antecedente migratorio',
            relacionadas: '/discover/:asis'
        },

    ]
    res.status(200).json(apis);
});



module.exports = router;