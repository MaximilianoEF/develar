const express = require('express');
const router = express.Router();
const service = require('../models/turnoSedeModel');

router.post('/', function(req, res) {
    service.create(req.body, function(error) {
        res.status(400).json(error);
    }, function(entity) {
        res.status(201).json(entity);
    });
});


router.get('/search', function(req, res) {
    service.findByQuery(req.query, function(error) {
        res.status(400).json(error);
    }, function(entities) {
        res.status(200).json(entities);
    });
});


router.get('/:id', function(req, res) {
    service.findById(req.params.id, function(error, entity) {
        if (error) {
            res.status(400).json(error);
        } else {
            res.status(200).json(entity);
        }
    });
});

router.get('/', function(req, res) {
    service.findAll(function(error) {
            res.status(400).json(error);
        },
        function(entities) {
            res.status(200).json(entities);
        });
});

router.put('/:id', function(req, res) {
    service.update(req.params.id, req.body, function(error) {
        res.status(400).json(error);
    }, function(entity) {
        res.status(200).json(entity);
    });
});

router.delete('/:id', function(req, res) {
    service.delete(req.params.id, function(error) {
        res.status(400).json(error);
    }, function(entity) {
        res.status(200).json(entity);
    });
});


module.exports = router;
