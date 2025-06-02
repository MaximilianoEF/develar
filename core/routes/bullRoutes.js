const express = require('express');
const router = express.Router();
const service = require('../services/bullQueueStatus.js');

const whoami = "Router:routes/bullRoutes: ";

/**
 * Testquee
 * usage: localhost:8080/api/queuestatus/test
 */
 router.get('/test', function (req, res) {
  service.testQueue(function (err) {
    res.status(400).json(err);

  }, function (entities) {
    res.status(200).json(entities);

  });
});

router.get('/pdf-progress', (req, res) => {
  service.pdfProgressStatus(
  (err) => {
    res.status(400).json(err);
  },
  (entities) => {
    res.status(200).json(entities);
  }
  )
})

router.get('/derivada-progress', function (req, res) {

  service.derivadaProgressStatus(function (err) {
    res.status(400).json(err);

  }, function (entities) {
    res.status(200).json(entities);

  });
});

router.get('/thumbnail-progress', function (req, res) {

  service.thumbnailProgressStatus(function (err) {
    res.status(400).json(err);

  }, function (entities) {
    res.status(200).json(entities);

  });
});

router.get('/progress', function (req, res) {
  service.progressStatus(function (err) {
    res.status(400).json(err);

  }, function (entities) {
    res.status(200).json(entities);

  });
});



/**
 * Retrieve status of all Queues
 */
router.get('/', function (req, res) {
  service.bullQueueStatus(function (err) {
    res.status(400).json(err);

  }, function (entities) {
    res.status(200).json(entities);

  });
});




module.exports = router;
