const whoami = "models/unidadDescripcionModel: ";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const utils = require('../services/commons.utils');

const auditSch = new Schema({
  estado:     { type: String,   required: false, default: null },
  fe_alta_tx: { type: String,   required: false, default: null },
  fe_alta_ts: { type: Number,   required: false, default: null },
  userId:     { type: String,   required: false, default: null },
  username:   { type: String,   required: false, default: null },
})
const unidadDescripcionProxySch = new Schema({
  atomSlug :       { type: String,   required: false, default: null },
  title :          { type: String,   required: false, default: null },
  idUda :          { type: String,   required: false, default: null },
  reference_code : { type: [String], required: false, default: null },
  assetId :        { type: String,   required: false, default: null },
})

const migranteSch = new Schema({
  num_expediente:     { type: String, required:false, default: null},
  barco:              { type: String, required:false, default: null},
  puerto:             { type: String, required:false, default: null},
  libro:              { type: String, required:false, default: null},
  caja:               { type: String, required:false, default: null},
  date_type:          { type: String, required:false, default: null},
  fe_migracion_tx:    { type: String, required:false, default: null},
  fe_migracion_ts:    { type: Number, required:false, default: null},
  anio_migracion:     { type: Number, required:false, default: null},
  
  nombre:             { type: String, required:false, default: null},
  apellido:           { type: String, required:false, default: null},
  fe_nacimiento_tx:   { type: String, required:false, default: null},
  fe_nacimiento_ts:   { type: Number, required:false, default: null},
  sexo:               { type: String, required:false, default: null},
  observaciones:      { type: String, required:false, default: null},
  novedad:            { type: String, required:false, default: null},
})

const accessionRecordsSch = new Schema({
  idAR:               { type: String, required:false, default: null},
  orden_relativo_uda: { type: Number, required:false, default: null},
  type:               { type: String, required:false, default: null},
  migrante:           { type: migranteSch, required: false, default : {}},
  audit:              { type: auditSch, required: false, default: {}},
  uda:                { type: unidadDescripcionProxySch, required:false, default: {}}
})

accessionRecordsSch.pre('save', function(next) {
  next();
});

const Record = mongoose.model('AccessionRecords', accessionRecordsSch, 'accessionrecords');

function buildQuery(query) {
  let q = {};

  if(query.date_type) {
    q['migrante.date_type'] = query.date_type;
  }
  if (query.anioDesde && query.anioHasta) {
    
    q['migrante.anio_migracion'] = { '$gte': parseInt(query.anioDesde), '$lt': parseInt(query.anioHasta) };
    } else {
    if (query.anioDesde) {
        q['migrante.anio_migracion'] = { "$gte": parseInt(query.anioDesde) };
    }

    if (query.anioHasta) {
        q['migrante.anio_migracion'] = { "$lt": parseInt(query.anioHasta) };
    }    
  }

  if(query.idUda) {
    q['uda.idUda'] = query.idUda;
  }
  return q;
}

/**
 * Retrieve all records
 * @param {*} errcb 
 * @param {*} cb 
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
 * Retrive records by query
 * @param {*} query 
 * @param {*} errcb 
 * @param {*} cb 
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
  })
};
/**
 * Retrieve record by id
 * @param {*} id 
 * @param {*} errcb 
 * @param {*} cb 
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
 * Update record by id
 * @param {*} id 
 * @param {*} record 
 * @param {*} errcb 
 * @param {*} cb 
 */
exports.update = async function (id, record, errcb, cb) {

  Record.findOneAndUpdate({ _id: id }, record, { new: true}, function (err, entity) {
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
 * Create record
 * @param {*} record 
 * @param {*} errcb 
 * @param {*} cb 
 */
exports.create = function (record, errcb, cb) {
  delete record._id;

  createAR(record, errcb, cb);

};

exports.upsert = function(record, errcb, cb) {

  if(record._id){
    Record.findByIdAndUpdate(record._id, record, { upsert: true, new: true },
      (err, entity) => {
        if(err) {
          errcb(err);
        } else {
          cb(entity)
        }
      }
      )
  } else {
    createAR(record, errcb, cb);
  }
  
}

exports.delete = function(id, errcb, cb) {
  Record.findByIdAndDelete(id, function(error, deleted) {
    if (error) {
      errcb(error);
    } else {
        cb({msj: 'ok'});
    }
});
}

const createAR = function (record, errcb, cb) {
  
  Record.create(record, function (err, entity) {
    if (err) {
      console.error('[%s] validation error as validate() argument ', whoami);
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entity);
    }
  });
}