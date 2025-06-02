const whoami = "models/auxiliarymodels/analiticoCyCModel: ";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const utils = require('../../services/commons.utils');


/** Constantes necesaria para popular la key company */

const AGN = 'AGN';
const AR = 'AR';

const LIMIT = 500;
const analiticocycSch = new mongoose.Schema({
  codigo_referencia:   {type: String,  required: false, default: "" },
  anverso:             {type: String,  required: false, default: "" },
  reverso:             {type: String,  required: false, default: "" },
  fondo:               {type: String,  required: false, default: "" },
  uco_orig:            {type: String,  required: false, default: "" },
  carpeta:             {type: String,  required: false, default: "" },
  inventario:          {type: String,  required: false, default: "" },
  tesauro:             {type: String,  required: false, default: "" },
  tesauro_neto:        {type: String,  required: false, default: "" },
  descripcion:         {type: String,  required: false, default: "" },
  onomastico_1:        {type: String,  required: false, default: "" },
  onomastico_2:        {type: String,  required: false, default: "" },
  fe_publicacion:      {type: String,  required: false, default: "" },
  nro_publicacion:     {type: String,  required: false, default: "" },
  observaciones:       {type: String,  required: false, default: "" },

  fe_publiacion_tx:   {type: String,  required: false, default: "" },
  fe_publiacion_ts:   {type: Number,  required: false, default: 0 },
  anio_publiacion:    {type: Number,  required: false, default: 0 },
  serie:              {type: String,  required: false, default: "" },
  estado:             {type: String,  required: false, default: "" },
  fe_importacion:     {type: String,  required: false, default: "" },
  
})


const Record = mongoose.model('Analiticocyc', analiticocycSch, 'analiticocyc');

exports.AnaliticoModel = Record;


/************************************************
 * QUERY
 *
 */

 function buildQuery(query) {
  let q = {};

  return q;
}

/************************************************
 * MÉTODOS PRIVADOS
 *
 */



/**
 * Retrieve all records
 * @param cb
 * @param errcb
 */
exports.findAll = function (errcb, cb) {
  Record.find().lean().exec(function (err, entities) {
    if (err) {
      errcb(err);
    } else {
      cb(entities);
    }
  });
};


/**
 * Retrieve records from query /search/?name=something
 * @param cb
 * @param errcb
 */
exports.findByQuery = function (query, errcb, cb) {
  console.dir(query);

  let regexQuery = buildQuery(query)
  console.dir(regexQuery);

  Record.find(regexQuery, function (err, entities) {
    if (err) {
      console.error('[%s] findByQuery ERROR: [%s]', whoami, err)
      errcb(err);
    } else {
      cb(entities);
    }
  }).limit(LIMIT);
};


/**
 * find by ID
 * @param id
 * @param cb
 * @param errcb
 */
exports.findById = function (id, errcb, cb) {
  Record.findOne({ _id: id }, function (err, entity) {
    if (err) {
      console.error('[%s] findByID ERROR() argument [%s]', whoami, arguments.length);
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entity);
    }
  });

};


/**
 * Upddate a new record
 * @param id
 * @param record
 * @param cb
 * @param errcb
 */
exports.update = async function (id, record, errcb, cb) {


  Record.findOneAndUpdate({ _id: id }, record, { new: true, __user: updatingUser, __reason: updatingReason }, function (err, entity) {
    if (err) {
      console.error('[%s] validation error as validate() argument [%o]', whoami, err)
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entity);
    }
  });
};


/**
 * Sign up a new record
 * @param record
 * @param cb
 * @param errcb
 */
exports.create = function (record, errcb, cb) {
  delete record._id;


  Record.create(record, function (err, entity) {
    if (err) {
      console.error('[%s] validation error as validate() argument ', whoami);
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entity);
    }
  });

};

/**
 * Sign up a new records
 * @param record
 * @param cb
 * @param errcb
 */
exports.createMany = function (record, errcb, cb) {
  delete record._id;

  let arrAux = [];
  for (let index = record.startIn; index < (record.startIn + record.udsNumber); index++) {
    let aux = JSON.parse(JSON.stringify(record));
    aux.identificador.identifier = aux.identificador.identifier + '-' + index;
    aux.identificador.title = aux.identificador.title + '-' + aux.identificador.identifier;
    arrAux.push(aux);
  }

  Record.insertMany(arrAux, function (err, entities) {
    if (err) {
      console.error('[%s] validation error as validate() argument ', whoami);
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entities);
    }
  })
}

exports.insertMany = function (records, errorCallback, successCallback) {
  const toInsert = records.map((token) => delete token._id);

  Record.insertMany(toInsert, function (error, entities) {
    if (error) {
      console.error(error);
      errorCallback(error);
    } else {
      successCallback(entities);
    }
  });
}


