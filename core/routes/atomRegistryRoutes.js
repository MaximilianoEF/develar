const express = require('express');
const router = express.Router();
const service = require('../models/atomRegistryModel.js');


router.get('/syncall', async (req, res) => {
    res.status(200).json( [ {status: 'ok'} ] );
    syncall();
});

async function syncall(){
  console.log('syncALL ATOM REGISTRY TO  BEGIN **********************')
  try {
    const records = await service.syncGestionDocWithAtom();
    if(records) {
      console.info('******** ATOM REGISTRY ENDED OK: [%s]', records.length);
      //res.status(200).json(records);
    }
    else {
      console.error('******** ATOM REGISTRY ENDED with ERROR: [%s]', records);
      //res.status(400).json(records);
    };
    return records;
  } catch (error) {
    console.error('******** ATOM REGISTRY CATCH ERROR: --->[%o]', error);
    //res.status(400).json(error);
  }


}

module.exports = router;
