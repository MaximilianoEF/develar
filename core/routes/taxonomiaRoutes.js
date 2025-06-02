const express = require('express');
const router = express.Router();
const service = require('../models/taxonomiaModel');

const whoami = 'Router:routes/tesauroGdocRoutes: ';

router.post('/', async (req, res) => {
  try {
    const entity = await service.create(req.body);
    res.status(201).json(entity);
  } catch(error) {
    res.status(400).json(error);
  }
});


router.put('/:id', async (req, res) => {
  try {
    const entity = await service.update(req.params.id, req.body);
    res.status(200).json(entity);
  } catch(error) {
    res.status(400).json(error);
  }
});


router.delete('/:id', async(req, res) => {
  try {
    const entity = await service.delete(req.params.id);
    res.status(200).json(entity);
  } catch(error) {
    res.status(400).json(error);
  }
});


router.get('/search', async (req, res) => {
  try {
    const entities = await service.findByQuery(req.query);
    res.status(200).json(entities);
  } catch(error) {
    res.status(400).json(error);
  }
});


router.get('/:id/unicidadsinonimo/:sinonimo', async (req, res) => {
  try {
    const sinonimoUnico = await service.esSinonimoUnicoEnTaxonomia(req.params.id, req.params.sinonimo);
    res.status(200).json(sinonimoUnico);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const entity = await service.findById(req.params.id);
    res.status(200).json(entity);
  } catch(error) {
    res.status(400).json(error);
  }
});



module.exports = router;
