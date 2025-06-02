const whoami = "models/auxiliarymodels/analiticoMigrantesModel: ";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const utils = require('../../services/commons.utils');


/** Constantes necesaria para popular la key company */

const AGN = 'AGN';
const AR = 'AR';

const LIMIT = 500;
const analiticomigrantesSch = new mongoose.Schema({
  embarque:         {type: String,  required: false, default: "" },
  barconombre:      {type: String,  required: false, default: "" },
  barcocodigo:      {type: String,  required: false, default: "" },
  apellido:         {type: String,  required: false, default: "" },
  nombre:           {type: String,  required: false, default: "" },
  edadanios:        {type: String,  required: false, default: "" },
  edadmeses:        {type: String,  required: false, default: "" },
  sexo:             {type: String,  required: false, default: "" },
  nacionalidad:     {type: String,  required: false, default: "" },
  profesion:        {type: String,  required: false, default: "" },
  fechaevento:      {type: String,  required: false, default: "" },
  aniomes:          {type: String,  required: false, default: "" },
  anioevento:       {type: String,  required: false, default: "" },
  fechaevento_ts:   {type: Number,  required: false, default: 0 },
  tipoevento:       {type: String,  required: false, default: "" },
  nrorden:          {type: String,  required: false, default: "" },
  nrolista:         {type: String,  required: false, default: ""},
  estado:           {type: String,  required: false, default: "" },
  lugarnacimiento:  {type: String,  required: false, default: "" },
  fe_importacion:   {type: String,  required: false, default: "" },
  
})


const Record = mongoose.model('Migrantesdnm', analiticomigrantesSch, 'migrantes');

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


