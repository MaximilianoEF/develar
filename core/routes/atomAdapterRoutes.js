const express = require('express');
const router = express.Router();
const service = require('../models/atomAdapterModel.js');


router.get('/syncall', async (req, res) => {

  res.status(200).json( [ {status: 'ok'} ] );
  syncall();
})

async function syncall(){
  console.log('syncALL ATOM ADAPTER TO  BEGIN **********************')
  try {
    const records = await service.syncAll();
    if(records) {
      console.info('******** ADAPTERS ENDED OK: [%s]', records.length);
      //res.status(200).json(records);
    }
    else {
      console.error('******** ADAPTERS ENDED with ERROR: [%s]', records);
      //res.status(400).json(records);
    };
    return records;
  } catch (error) {
    console.error('******** ADAPTERS CATCH ERROR: [%o]', error);
    //res.status(400).json(error);
  }
  

}



module.exports = router;
