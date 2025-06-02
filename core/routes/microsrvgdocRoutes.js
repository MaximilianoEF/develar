/**
 * microservicios gestion doc
 * /api/msrvgestiondoc
 */

var express = require('express');
var router = express.Router();

var bagitmsrv = require('../models/msrvgestiondoc/bagitmsrvService.js');
var rsyncmsrv = require('../models/msrvgestiondoc/rsyncService.js');
const rsyncDerivadaMsrv = require('../models/msrvgestiondoc/rsyncDerivadaService');
const imagemsrv = require('../models/msrvgestiondoc/imagemsrvService');

const whoami =  "Router:routes/microsrvgdocRoutes: ";

/**
 * Retrieve all entities
 */
router.get('/', function (req, res) {
    service.findAll(function(err) {
        res.status(400).json(err);

    }, function(entities) {
        res.status(200).json(entities);

    });
});

/**
 * ************************
 *       PRODUCERS
 * **********************
 */


/**
 * pushbagit
 */

router.post('/pushbagit', function (req, res) {
    bagitmsrv.pushbagittask(req.body, function(err) {
        res.status(400).json(err);

    }, function(entity) {
        res.status(200).json(entity);

    });
});


router.post('/rsync/ingesttomaster', function (req, res) {
    rsyncmsrv.ingesttomaster(req.body, function(err) {
        console.error(err)
        res.status(400).json(err);

    }, function(entity) {
        res.status(200).json(entity);

    });
});

/**
 * Mueve -rsync- la carpeta ingestada hacia el servidor de derivadas
 *
 * Ruta: /api/msrvgestiondoc/rsync/ingesttoderivadas
 */
router.post('/rsync/ingesttoderivadas', function (req, res) {
  rsyncDerivadaMsrv.ingestToDerivada(req.body, function(err) {
    res.status(400).json(err);
  }, function(entity) {
    res.status(200).json(entity);
  });
});


/**
 * Genera las miniaturas para una carpeta de ingesta
 */
router.post('/thumbnails', function(req, res) {
    imagemsrv.buildThumbnails(req.body, function(err) {
      console.error(err);
      res.status(400).json(err);
    }, function(entity) {
      res.status(200).json(entity);
    });
});


/**
 * Genera la derivada para un asset concreto
 *
 * Ruta: /api/msrvgestiodoc/derivadas/[asset ID]
 */
router.post('/derivadas/:id', function(req, res) {
  imagemsrv.buildDerivadaAsset(req.body, function(err) {
    res.status(400).json(err);
  }, function(entity) {
    res.status(200).json(entity);
  });
});

/**
 * Genera las derivadas para todo un parte de ingesta
 *
 * Ruta: /api/msrvgestiondoc/derivadas
 */
router.post('/derivadas', function(req, res) {
  imagemsrv.buildDerivadas(req.body, function(err) {
    console.error(err);
    res.status(400).json(err);
  }, function(entity) {
    res.status(200).json(entity);
  });
});

module.exports = router;
