/**
 * Recordcard routes
 */
/**
 * Load module dependencies
 */
var express = require('express');
var router = express.Router();
var service = require('../models/assetModel.js');
var imageUtil = require('../services/imageutils.js');
const whoami = "Router:routes/assetRouter: ";

/**
 * Retrieve all entities
 */
router.get('/', function(req, res) {
    service.findAll(function(err) {
        res.status(400).json(err);

    }, function(entities) {
        res.status(200).json(entities);

    });
});

/**
 * search entities
 */
router.get('/search', function(req, res) {
    service.findByQuery(req.query, function(err) {
        res.status(400).json(err);

    }, function(entities) {
        res.status(200).json(entities);

    });
});

router.get('/pdf/exist/:id', (req, res) => {
    service.pdfExist(req.params.id,
      (err) => {
        res.status(400).json(err);
      },
      (exist) => {
        res.status(200).json(exist)
      }
      )
  })

/**
 * Retrieve Entity by ID
 */
router.get('/:id', function(req, res) {
    service.findById(req.params.id, function(err) {
        res.status(400).json(err);

    }, function(entities) {
        res.status(200).json(entities);

    });
});

/**
 * Retrieve Resource from entity
 */
router.get('/retrieve/:id', function(req, res) {

    service.findById(req.params.id, function(err) {
        res.status(400).json(err);

    }, function(entities) {
        res.status(200).json(entities);

    });
});

/**
 * Obtener datos EXIF de un asset (si es posible)
 * Pre:
 * - Asset ID recibido por parámetro URL
 *
 * Post:
 * - JSON conteniendo los datos EXIF o NULL en caso de error
 */
router.get('/exif/:id', async function(req, res) {
    service.findById(req.params.id, function(error) {
        res.status(400).json(error);
    }, async function(entity) {
        try {
            const metadata = await imageUtil.fetchEXIFData(entity.serverPath, entity.path);
            res.status(200).json(metadata);
        } catch (error) {
            console.log(error);
            res.status(400).json(error);
        }
    });
});

/**
 * Create new entity
 */
router.post('/', function(req, res) {
    service.create(req.body, function(err) {
        res.status(400).json(err);

    }, function(entity) {
        res.status(201).json(entity);

    });
});

router.post('/insertmany', function(req, res) {
    service.createMany(req.body, function(error) {
        res.status(400).json(error);
    }, function(entities) {
        res.status(201).json(entities);
    });
});


/**
 * Update entity
 */
router.put('/:id', function(req, res) {
    service.update(req.params.id, req.body,
        function(err) {
            res.status(400).json(err);

        },
        function(entity) {
            res.status(201).json(entity);

        });
});

router.post('/deletemany', function(req, res) {
    service.deleteMany(req.body, function(err) {
        res.status(400).json(err);
    }, function(entities) {
        res.status(200).json(entities);
    });
});

router.delete('/:id', function(req, res) {
    service.delete(req.params.id, function(err) {
        res.status(400).json(err);
    }, function(entity) {
        res.status(201).json(entity)
    })
})



module.exports = router;
