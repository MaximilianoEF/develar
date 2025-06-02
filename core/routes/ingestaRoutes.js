const express = require('express');
const router = express.Router();
const serviceIngestFolder = require('../services/ingestFolderService');
const serviceIngestProcess = require('../models/ingestProcessModel');
const workflowService = require('../services/ingestaWorkflowService')
const routes = {
    resumen: '/resumen',
    resumenArbol: '/arbol',
    escanear: '/escanear',
};

router.get(routes.resumen, async(req, res) => {
    try {
        const resume = await serviceIngestFolder.getFolderResume(req.query.folder, req.query.server);
        res.status(200).json(resume);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});

router.get(routes.escanear, async(req, res) => {
    try {
        const assetList = await serviceIngestFolder.createAssetsListFromFolder(req.query.folder, req.query.server);
        res.status(200).json(assetList);
    } catch (error) {
        res.status(400).json(error);
    }
});


router.get(routes.resumenArbol, async (req, res) => {
    try {
        const directoryTree = await serviceIngestFolder.getFolderTree(req.query.folder, req.query.server);
        console.log("directoryTree --> %o",directoryTree)
        res.status(200).json(directoryTree);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});

router.get('/search', function(req, res) {
    serviceIngestProcess.findByQuery(req.query, function(error) {
            res.status(400).json(error)
        },
        function(resultado) {
            res.status(200).json(resultado);
        });
});

router.put('/workflow/:action', function(req, res) {
    workflowService.updateWorkflow(req.params.action, req.body, function(error) {
        res.status(400).json(error);
    }, function(entity) {
        res.status(200).json(entity)
    })
})


router.post('/', function(req, res) {
    serviceIngestProcess.create(req.body, function(err) {
        res.status(400).json(err);
    }, function(entity) {
        res.status(200).json(entity);
    })
})


router.get('/:id', function(req, res) {
    serviceIngestProcess.findById(req.params.id, function(error) {
            res.status(400).json(error)
        },
        function(resultado) {
            res.status(200).json(resultado);
        });
});

router.put('/:id', function(req, res) {
    serviceIngestProcess.update(req.params.id, req.body, function(error) {
        res.status(400).json(error);
    }, function(entity) {
        res.status(200).json(entity)
    })
})


module.exports = router;
