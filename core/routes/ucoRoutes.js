const express = require('express');
const router = express.Router();
const service = require('../models/ucoModel');


router.get('/search', function(req, res) {
    service.findByQuery(req.query, function(error) {
            res.status(400).json(error)
        },
        function(resultado) {
            res.status(200).json(resultado);
        });
});


router.post('/', function(req, res) {
    service.create(req.body, function(err) {
        res.status(400).json(err);
    }, function(entity) {
        res.status(200).json(entity);
    })
})


router.get('/:id', function(req, res) {
    service.findById(req.params.id, function(error) {
            res.status(400).json(error)
        },
        function(resultado) {
            res.status(200).json(resultado);
        });
});

router.put('/:id', function(req, res) {
    service.update(req.params.id, req.body, function(error) {

        res.status(400).json(error);
    }, function(entity) {
        res.status(200).json(entity)
    })
})

router.get('/', function(req, res){
    service.findAll(function(err){
        res.status(400).json(err)
    },function(entity){
        res.status(200).json(entity)
    })
})

module.exports = router;