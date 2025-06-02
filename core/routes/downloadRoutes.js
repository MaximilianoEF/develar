/**
 * Commons routes
 **/
const whoami = "Router:routes/downloadRoutes: ";
const path = require('path');

const express = require('express');
const router = express.Router();
const asset = require('../models/assetModel');

router.get('/withserver/:id', function (req, res) {
  asset.findDownloadRouteById(req.params.id, function (err) {
    res.status(400).json(err);
  }, function (redirectPath) {
    res.redirect(redirectPath);
  });
});

/**
 * Solicitud de miniatura ('thumbnail') de un asset; en caso de que no exista la miniatura, devuelve un ícono de
 * carpeta. Por lo general, las miniaturas se ubican bajo la sub-carpeta 'thumbnails' de la carpeta de ingesta.
 *
 * Ruta: /download/thumbnail/:id
 */
router.get('/thumbnail/:id', function (req, res) {
  asset.findThumbnailDownloadRouteById(req.params.id, function (err) {
    res.status(400).json(err);
  }, function (redirectPath) {
    res.redirect(redirectPath);
  });
});

/**
 * Solicitud de derivada de un asset; en caso de que no exista la derivada, devuelve un ícono de
 * carpeta. Por lo general, las derivadas-factory se ubican bajo la sub-carpeta 'derivadas-factory' de la carpeta de ingesta.
 *
 * Ruta: /download/derivada/:id
 */
router.get('/derivada/:id', function (req, res) {
  asset.findDerivadaDownloadRouteById(req.params.id, function (err) {
    res.status(400).json(err);
  }, function (redirectPath) {
    res.redirect(redirectPath);
  });
});

router.get('/:id', function (req, res) {
  asset.findPathById(req.params.id, function (err) {
    res.status(400).json(err);

  }, function (target) {
    res.redirect(path.join('/', target));

  });
});

router.get('/*', function (req, res) {
  let target = req.originalUrl.substr(req.baseUrl.length);
  res.redirect(target);
});


module.exports = router;
