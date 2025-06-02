const express = require('express');
const router = express.Router();
const service = require('../models/authorityRecordModel.js');

/**
 * Devuelve todos los registros
 *
 */
router.get('/', async(req, res) => {
    try {
        const records = await service.findAll();
        res.status(200).json(records);
    } catch (error) {
        res.status(400).json(error);
    }
});

/**
 * Devuelve los registros coincidentes con una consulta
 *
 */
router.get('/search', async(req, res) => {
    try {
        const records = await service.findByQuery(req.query);
        res.status(200).json(records);
    } catch (error) {
        res.status(400).json(error);
    }
});

/**
 * Devuelve un registro buscándolo por su ID (ID de MongoDB)
 *
 */
router.get('/:id', async(req, res) => {
    try {
        const record = await service.findById(req.params.id);
        res.status(200).json(record);
    } catch (error) {
        res.status(400).json(error);
    }
});

/**
 * Da de alta un registro
 *
 */
router.post('/', async(req, res) => {
    try {
        const created = await service.create(req.body);
        res.status(201).json(created);
    } catch (error) {
        res.status(400).json(error);
    }
});

/**
 * Actualiza un registro
 *
 */
router.put('/:id', async(req, res) => {
    try {
        const updated = await service.update(req.params.id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});


module.exports = router;