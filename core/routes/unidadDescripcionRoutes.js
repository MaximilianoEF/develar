/**
 * Unidad Descripcion routes
 */

const express = require('express');
const router = express.Router();
const service =       require('../models/unidadDescripcionModel.js');
const serviceDNE =    require('../models/auxiliarymodels/analiticoDNEModel.js');
const serviceUNIREN = require('../models/auxiliarymodels/analiticoUNIRENModel.js');
const serviceCAL =    require('../models/auxiliarymodels/analiticoCALModel.js');
const serviceVERNET = require('../models/auxiliarymodels/analiticoVERNETModel.js');

const whoami = "Router:routes/unidadDescripcionRoutes: ";


/*
 * Genera un archivo XLS listo para dar de alta en AtoM
 */
router.get('/prepararexportatom', async (req, res) => {
  try {
    const resultado = await service.prepararExcelParaAtom(req.query, req, res);
    res.status(200).json(resultado);
  } catch(error) {
    res.status(400).json(error);
  }
});

router.get('/exportatom/:timestamp', (req, res) => {
  service.exportarExcelParaAtom(req.params.timestamp, req, res);
});


// sincronizar ANALÍTICOS con UDAS
// sincronizar/cyc       /models/unidadDescripcionModel.js
// sincronizar/dne       /models/auxiliarymodels/analiticoDNEModel.js
// sincronizar/uniren    /models/auxiliarymodels/analiticoUNIRENModel.js
// sincronizar/cal       /models/auxiliarymodels/analiticoCALModel.js
// sincronizar/vernet    /models/auxiliarymodels/analiticoVERNETModel.js

router.get('/sincronizar/cyc', async(req, res) => {
  try {
   const results = await service.seekForDataCyC();
   res.status(200).json(results);
  } catch(error) {
    console.error(error);
    res.status(400).json(error);
  }
})

router.get('/sincronizar/dne', async(req, res) => {
  try {
    const results = await serviceDNE.seekForData();
    res.status(200).json(results);
  } catch(error) {
    console.error("Error en sincronizar DNE");
    res.status(400).json(error);
  }
})

router.get('/sincronizar/uniren', async(req, res) => {
  try {
    // const results = await serviceUNIREN.seekForData();
    // res.status(200).json(results);
    res.status(200).json([]);
  } catch(error) {
    console.error("Error en sincronizar UNIREN");
    res.status(400).json(error);
  }
})

router.get('/sincronizar/cal', async(req, res) => {
  try {
    // const results = await serviceCAL.seekForData();
    // res.status(200).json(results);
    res.status(200).json([]);
  } catch(error) {
    console.error("Error en sincronizar CAL");
    res.status(400).json(error);
  }
})

router.get('/sincronizar/vernet', async(req, res) => {
  try {
    // const results = await serviceVERNET.seekForData();
    // res.status(200).json(results);
    res.status(200).json([]);
  } catch(error) {
    console.error("Error en sincronizar VERNET");
    res.status(400).json(error);
  }
})

/*
 * Retorna el registro previo y siguiente (si existen) para la UDA
 * especificada
 */
router.get('/prevnext/:id', function (req, res) {
  service.findPrevNext(req.params.id, function (err) {
    res.status(400).json(err);
  }, function (results) {
    res.status(200).json(results);
  });
});

/**
 * Retrieve all entities
 */
router.get('/', function (req, res) {
  service.findAll(function (err) {
    res.status(400).json(err);

  }, function (entities) {
    res.status(200).json(entities);

  });
});


/**
 * search entities
 */
router.get('/search', function (req, res) {
  service.findByQuery(req.query, function (err) {
    res.status(400).json(err);

  }, function (entities) {
    res.status(200).json(entities);

  });
});


router.get('/childrentree/:id', (req, res) => {
  service.buildChildrenTreeCollectingAssets(req.params.id,
    function (err) {
      console.log("error --> %o",err)
      res.status(400).json(err);
    },
    function(entities){
      res.status(200).json(entities);
    }
    )
})

router.get('/apareo/:id', (req,res) => {
  service.fetchApareoTree(req.params.id,
    (error) => {
      console.log("Error --> %o",error);
      res.status(400).json(error)
    },
    (entities) => {
      res.status(200).json(entities);
    })
})

router.put('/apareo', (req, res) => {
  service.updateUdasFromApareo(req.body,
    (err) => {
      console.log("Error en update apareo --> %o",err)
    }, (entities) => {
      res.status(200).json(entities);
    })
})
router.get('/childrenlist/:id', (req, res) => {
  service.fetchChildren(req.params.id,
    function (err) {
      console.log("error --> %o",err)
      res.status(400).json(err);
    },
    function(entities){
      res.status(200).json(entities);
    }
    )
})

router.get('/nuevajerarquia/:id', (req, res) => {
  service.rebuildReferenceCode(req.params.id,
    function (err) {
      console.log("error --> %o",err)
      res.status(400).json(err);
    },
    function(entities){
      res.status(200).json(entities);
    }
    )
})

/**
 * ATOM DATA
 */


router.get('/atom/informationobjects/:slug/migrate', (req, res) => {
  service.getInformationObject(req.params.slug)
    .then((result) => result.json())
    .then((resultJson) => {
      if (resultJson && resultJson.id === 'internal-error') {
        res.status(400).send(resultJson);
      } else {
        service.performMigration(req.params.slug, resultJson)
          .then((migrationResult) => {
            res.status(200).json(migrationResult);
          })
          .catch((migrationError) => {
            res.status(400).json(migrationError);
          })
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error);
    })

});


router.get('/atom/informationobjects/:slug', (req, res) => {

  service.getInformationObject(req.params.slug)
    .then((result) => result.json())
    .then((resultJson) => {
      res.status(200).send(resultJson);
    })
    .catch((error) => {
      res.status(400).json(error);
    })

});

router.get('/atom/informationobjects', (req, res) => {

  service.getInformationObjects()
    .then((result) => result.json())
    .then((resultJson) => {
      res.status(200).send(resultJson);
    })
    .catch((error) => {
      res.status(400).json(error);
    })

});

router.get('/atom/parentchild', async (req, res) => {
  res.status(200).json([{process: 'ok'}]);
  parentChildProcess();

})

async function parentChildProcess(){
  try {
    const parentChildResults = await service.initSyncParentChild();
    if(parentChildResults) {
      console.info('******** ADAPTERS ENDED OK: [%s]', parentChildResults.length);
      //res.status(200).json(parentChildResults);
    }
    else {
      console.error('******** ADAPTERS ENDED with ERROR: [%s]', parentChildResults);
      //res.status(400).json(parentChildResults);
    };

  } catch (error) {
    console.error("error --> %o", error)
  }

}

router.get('/stringify', function (req, res) {
  service.rebuildStringify(function (error) {
    console.log("se produjo un error --> %o", error)
    res.status(400).json(error);
  }, function (result) {
    if (result)
      res.status(200).json({ mensaje: 'REVIEW DB :: Stringify OK' });
  })
});


/**
 * Retrieve history for specific entity
 *
 */
router.get('/:id/history', function (req, res) {
  service.fetchHistory(req.params.id, function (err) {
    res.status(400).json(error);
  }, function (history) {
    res.status(200).json(history);
  });
});

router.get('/:id/mapjerarquia', function (req, res) {
  service.buildJerarquiaMap(req.params.id, function (err) {
    res.status(400).json(err)
  }, function (jerarquia) {
    // console.log("jerarquia --> %o",jerarquia)
    res.status(200).json(jerarquia)
  })
})

router.get('/:id/mapproceduretxt', function (req, res) {
  service.initProcedureTxt(req.params.id, function (err) {
    res.status(400).json(err)
  }, function (jerarquia) {
    res.status(200).json(jerarquia);
  })
})


/**
 * Retrieve Entity by ID
 */
router.get('/:id', function (req, res) {
  service.findById(req.params.id, function (err) {
    res.status(400).json(err);

  }, function (entities) {
    res.status(200).json(entities);

  });
});


/**
 * Create new entity
 */
router.post('/', function (req, res) {

  service.create(req.body, function (err) {
    res.status(400).json(err);

  }, function (entity) {
    res.status(201).json(entity);

  });

});

/**
 * Create new entities
 */
router.post('/insertmany', function (req, res) {
  console.log("en backend --> %o", req.body)
  if (req.body.udsNumber && req.body.udsNumber > 1) {
    service.createMany(req.body, function (err) {
      res.status(400).json(err);
    }, function (entity) {
      res.status(201).json(entity);
    });
  }
});

router.post('/createmany', function (req, res) {
  service.insertMany(req.body, function (error) {
    res.status(400).json(error);
  }, function (entities) {
    res.status(201).json(entities);
  });
});

router.post('/deletemany', function (req, res) {
  service.deleteMany(req.body, function (err) {
    res.status(400).json(err);
  }, function (entities) {
    res.status(200).json(entities);
  });
});


/**
 * Update entity
 */
router.put('/:id', function (req, res) {
  service.update(req.params.id, req.body,
    function (err) {
      res.status(400).json(err);

    },
    function (entity) {
      res.status(201).json(entity);

    });
});


module.exports = router;
