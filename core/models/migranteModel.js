const whoami = "models/migranteModel: ";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const utils = require('../services/commons.utils');
const LIMIT = 500;

const AnaliticoLibros = require('./auxiliarymodels/analiticoLibrosModel');
const udaModule = require('../models/unidadDescripcionModel')

const AnaliticoModel = AnaliticoLibros.AnaliticoModel;
const UdaModel = udaModule.GestionDocRecord;

const migranteSch = new Schema({
  embarque: { type: String, required: false, default: '' },
  barconombre: { type: String, required: false, default: '' },
  barcocodigo: { type: String, required: false, default: '' },
  apellido: { type: String, required: false, default: '' },
  nombre: { type: String, required: false, default: '' },
  edadanios: { type: String, required: false, default: '' },
  edadmeses: { type: String, required: false, default: '' },
  sexo: { type: String, required: false, default: '' },
  nacionalidad: { type: String, required: false, default: '' },
  profesion: { type: String, required: false, default: '' },
  fechaevento: { type: String, required: false, default: '' },
  aniomes: { type: Number, required: false, default: 0 },
  anioevento: { type: Number, required: false, default: 0 },
  fechaevento_ts: { type: Number, required: false, default: 0 },
  tipoevento: { type: String, required: false, default: '' },
  nroorden: { type: String, required: false, default: '' },
  nrolista: { type: String, required: false, default: '' },
  estado: { type: String, required: false, default: '' },
  lugarnacimiento: { type: String, required: false, default: '' },
  fe_importacion: { type: String, required: false, default: '' },
  mesevento: { type: Number, required: false, default: 0 },
})


const Record = mongoose.model('Migrantes', migranteSch, 'migrantes');

exports.getRecord = function() {
  return Record;
}


function buildQuery(query) {
  let q = {};

  if (query.nombre) {
    q['nombre'] = { "$regex": query.nombre, '$options': 'ig' };
  }

  if (query.apellido) {
    q['apellido'] = { "$regex": query.apellido, '$options': 'ig' };
  }

  if (query.barconombre) {
    q['barconombre'] = { "$regex": query.barconombre, '$options': 'ig' };
  }

  if (query.anioDesde && query.anioHasta) {

    q['anioevento'] = { '$gte': parseInt(query.anioDesde), '$lte': parseInt(query.anioHasta) };
  } else {
    if (query.anioDesde) {
      q['anioevento'] = { "$gte": parseInt(query.anioDesde) };
    }

    if (query.anioHasta) {
      q['anioevento'] = { "$lte": parseInt(query.anioHasta) };
    }
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

  Record.find(regexQuery)
    .lean()
    .sort({ anioevento: -1, apellido: -1, nombre: -1 })
    .limit(LIMIT)
    .exec(function (err, entities) {
      if (err) {
        console.error('[%s] findByQuery ERROR: [%s]', whoami, err)
        errcb(err);
      } else {
        cb(entities);
      }
    });
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

  Record.findOneAndUpdate({ _id: id }, record, { new: true }, function (err, entity) {
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


exports.delete = function (id, errcb, cb) {
  Record.findByIdAndDelete(id, function (error, deleted) {
    if (error) {
      errcb(error);
    } else {
      cb({ msj: 'ok' });
    }
  });
}

/**
 * Busca en la colección de libros, algún registro que comprenda a la
 * fecha de arribo
 *
 * @param fechaarribots Fecha de arribo en formato timestamp
 * @param errcb error-callback
 * @param cb success-callback
 */
exports.findDocumentation = function (fechaarribots, errcb, cb) {
  AnaliticoLibros.findByQuery({ fechaarribots }, function (err) {
    errcb(err);
  }, function (results) {
    cb(results);
  })
}

const queryMaster = {
  'identificador.reference_code': 'DNM01',
  'identificador.level_of_description': 'unidad documental'
}

exports.seekForAnalyticData = async () => {

  try {
    const udas = await UdaModel.find(queryMaster).lean().exec();
    if (udas) {
      if (udas.length) {
        const udasUpdated = [];
        console.log('Retrieved: [%s]', udas.length)
        for (let index = 0; index < udas.length; index++) {
          udasUpdated.push(await processOneUda(udas[index]));
        }
        return udasUpdated;
      } else {
        console.error('oopsss');
      }
    }
  } catch (error) {
    console.error('oopsss');
    throw new error;
  }
};

async function processOneUda(uda) {
  console.log('UDS: [%s]', uda.identificador.identifier)
  let inventario = uda.audit.inventario;
  if (inventario) {
    let analiticos = await AnaliticoModel.find({ libroid: inventario }).exec()
    if (analiticos && analiticos.length) {
      let analitico = analiticos[0]
      console.log('Found! [%s] -----> [%s]', inventario, analitico.titulo)
      uda = await updateUdaFromAnalitico(uda, analitico);
    } else {
      console.error('Not found: [%s]', inventario);
    }

  }
  return uda;
}

async function updateUdaFromAnalitico(uda, analitico) {
  let fed = utils.parseDateStr(analitico.fedesde);
  let feh = utils.parseDateStr(analitico.fehasta);
  let fed_ts = fed ? fed.getTime() : 0;
  let feh_ts = feh ? feh.getTime() : 0;
  let fechatexto = `${analitico.aniod}/${analitico.mesd} - ${analitico.anioh}/${analitico.mesh}`;
  uda.identificador.title = `${analitico.titulo} (#${analitico.libroid})`;

  let fechas = uda.identificador.dates;
  if (fechas && fechas.length) {
    let fecha_existente = fechas.find(fe => fe.type === 'migraciones');

    // actualiza datos, se pretende que haya un solo registro de migraciones.
    if (fecha_existente) {
      fecha_existente.start_date = analitico.fedesde;
      fecha_existente.end_date = analitico.fehasta;
      fecha_existente.date = fechatexto;
      fecha_existente.start_date_ts = fed_ts;
      fecha_existente.end_date_ts = feh_ts;

    } else {
      let fechatoken = {
        type: 'migraciones',
        start_date: analitico.fedesde,
        end_date: analitico.fehasta,
        date: fechatexto,
        start_date_ts: fed_ts,
        end_date_ts: feh_ts,
      }
      fechas.push(fechatoken);
    }

  } else {
    let fechatoken = {
      type: 'migraciones',
      start_date: analitico.fedesde,
      end_date: analitico.fehasta,
      date: fechatexto,
      start_date_ts: fed_ts,
      end_date_ts: feh_ts,
    }
    uda.identificador.dates = [fechatoken];
  }
  return await UdaModel.findOneAndUpdate({ _id: uda._id }, uda).exec()

}