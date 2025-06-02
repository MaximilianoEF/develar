const whoami = "models/ingestProcessModel";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const asset = require('./assetModel');
const unidadDescripcion = require('./unidadDescripcionModel');



/**
 * Esquema con fines de auditoría, determinados a guardar qué usuario y en
 * qué momento se realiza una modificación
 */
const auditSch = new Schema({
  userId: { type: String, required: false, default: null },
  username: { type: String, required: false, default: null },
  ts_alta: { type: Number, required: false, default: null }
});

/**
 * Esquema para datos administrativos: sector a cargo, estado del proceso de
 * ingesta, números de comprobantes, nivel de avance, datos de auditoría,
 * y otros
 */
const adminDataSch = new Schema({
  compPrefix: { type: String, required: false, default: null },
  compId: { type: String, required: false, default: null },
  compName: { type: String, required: false, default: null },
  compNum: { type: Number, required: false, default: null },
  fe_comp_tx: { type: String, required: false, default: null },
  fe_comp_ts: { type: Number, required: false, default: null },
  sector: { type: String, required: false, default: null },
  action: { type: String, required: false, default: null },
  fe_tx: { type: String, required: false, default: null },
  fe_ts: { type: Number, required: false, default: null },

  audit: { type: auditSch, required: false, default: {} },
  approvedBy: { type: auditSch, required: false, default: {} },

  estado: { type: String, required: false, default: null },
  avance: { type: String, required: false, default: null },
  avanceList: { type: [String], required: false, default: [] },

  tipoParte: { type: String, required: false, default: null }
});

/**
 * Representa una relación entre un asset propiamente dicho, y un proceso
 * de ingesta
 */
const assetHookSch = new Schema({
  assetId: { type: String, required: false },
  assetType: { type: String, required: false },
  assetParentId: { type: String, required: false},
  orderBy: { type: String, required: false },
  assetName: { type: String, required: false },
  assetFilename: { type: String, required: false },
  assetSlug: { type: String, required: false },
  predicate: { type: String, required: false },
  isVinculado: { type: Boolean, required: false },
  itemId: { type: String, required: false },
  itemParentId: { type: String, required: false },
  itemName: { type: String, required: false },
  itemIdentifier: { type: String, required: false },
  itemRole: { type: String, required: false },
  itemLevel: { type: String, required: false },
  isPart: { type: Boolean, required: false },
  partCardinal: { type: Number, required: false },
  partPredicate: { type: String, required: false }
});

const ingestSummarySch = new Schema({
  isAlta: { type: Boolean, required: false, default: true },
  hasVinculados: { type: Boolean, required: false, default: false },
  udsCount: { type: Number, required: false, default: 0 },
  assetsCount: { type: Number, required: false, default: 0 },
  vinculadosCount: { type: Number, required: false, default: 0 }
});

const ucoProxySch = new Schema({
  id_uco: { type: String, required: false, default: null },
  cod_uco: { type: String, required: false, default: null },
  cod_barras: { type: String, required: false, default: null },
  slug: { type: String, required: false, default: null },
})

/**
 * Representa una carpeta de ingesta, asociada a una unidad documental
 * compuesta
 */
const ingestFolderSch = new Schema({
  server: { type: String, required: false, default: 'ingesta' },
  assetId: { type: String, required: false },

  path: { type: String, required: false, default: null },
  serverPath: { type: String, required: false, default: null },
  rootPath: { type: String, required: false, default: null },

  basename: { type: String, required: false, default: null },
  name: { type: String, required: false, default: null },

  isBaggit: { type: Boolean, required: false, default: false },
  isLocked: { type: Boolean, required: false, default: false },


  hasDerivadas: { type: Boolean, required: false, default: false },
  hasThumbnails: { type: Boolean, required: false, default: false },

});

/**
 * Representa diversos parámetros de ingesta, a ser completados por el área de
 * digitalización
 */
const ingestParamsSch = new Schema({
    machineId: { type: String, required: false, default: null },
    machineSlug: { type: String, required: false, default: null },
    machineTypeDigitalizacion: { type: String, required: false, default: null },
    machineReport: { type: String, required: false, default: null },
    machineCod: { type: String, required: false, default: null }
});

/**
 * Representa un plan de ingesta. Un plan de ingesta son recomendaciones del área
 * de archivística para el área de digitalización, a ser tenidas en cuenta durante
 * el proceso de digitalización de los documentos
 */
const ingestPlanSch = new Schema({
    //planName: { type: String, required: false, default: null },
    itemPartRatio: { type: Number, required: false, default: 1 },
    partPredicates: { type: [String], required: false, default: [] },
    informeTxt: { type: String, required: false, default: null },
    dpi: { type: String, required: false, default: null },
    indicacionesTxt: { type: String, required: false, default: null },
    userAdmin: { type: String, required: false, default: null },
    ingestParams: { type: ingestParamsSch, required: false, default: {} }
});


const udaHookSch = new Schema({
    udaId:                { type: String,   required: false, default: null },
    title:                { type: String,   required: false, default: null },
    reference_code:       { type: [String], required: false, default: [] },
    identifier:           { type: String,   required: false, default: null },
    level_of_description: { type: String,   required: false, default: null },
})

/**
 * Modela un proceso de ingesta
 * TODO: Completar documentación
 */
const ingestProcessSch = new Schema({
    slug: { type: String, required: false, default: null },
    admin: { type: adminDataSch, required: false, default: {} },
    ingestFolder: { type: ingestFolderSch, required: false, default: {} },
    // assetList: { type: [assetHookSch], required: false, default: [] },
    assetList: { type: [asset.assetSch], required: false, default: [] },
    assetHookList: { type: [assetHookSch], required: false, default: [] },

    udaHook: { type: udaHookSch, required: false, default: {} },

    manifestAsset: { type: assetHookSch, required: false, default: {} },
    statistics: { type: ingestSummarySch, required: false, default: {} },
    ingestPlan: { type: ingestPlanSch, required: false, default: {} },

    ucos: { type: [ucoProxySch], required: false, default: [] },

    // udList: { type: [udProxySch], required: false, default: [] }
    udaList: { type: [unidadDescripcion.unidadDescripcionSch], required: false, default: [] }
});



exports.ingestProcessSch = ingestProcessSch;


function buildQuery(query) {
    let q = {};

    if (query.compNum) {
        q['admin.compNum'] = query.compNum;
    }

    if (query.slug) {
        q['slug'] = { '$regex': query.slug, '$options': 'ig' };
    }

    if (query.avance) {
        q['admin.avance'] = query.avance;
    }

    if (query.fechaDesde && query.fechaHasta) {
        //q['$and'] = [{ 'fecomp_tsa': { '$gte': parseInt(query.fechaDesde, 10), '$lt': parseInt(query.fechaHasta, 10) } }];
        q['admin.fe_ts'] = { '$gte': parseInt(query.fechaDesde, 10), '$lt': parseInt(query.fechaHasta, 10) };
    } else {
        if (query.fechaDesde) {
            q['admin.fe_ts'] = { "$gte": parseInt(query.fechaDesde, 10) };
        }

        if (query.fechaHasta) {
            q['admin.fe_ts'] = { "$lt": parseInt(query.fechaHasta, 10) };
        }
    }

    return q;
}




ingestProcessSch.pre('save', function(next) {
    return next();
});


/**
 * @param String: nombre del Modelo
 * @param Schema: Schema a partir del cual crear el modelo
 * @param String: nombre a asignar a las colecciones de modelos (en plural)
 */
const Record = mongoose.model('IngestProcess', ingestProcessSch, 'ingestprocesses');

exports.getRecord = function() {
    return Record;
}




/////////   CAPA DE SERVICIOS /////////////
/**
 * Retrieve all records
 * @param cb
 * @param errcb
 */
exports.findAll = function(errcb, cb) {
    Record.find().lean().exec(function(err, entities) {
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
exports.findByQuery = function(query, errcb, cb) {
    let regexQuery = buildQuery(query);


    Record.find(regexQuery).lean().exec(function(err, entities) {
        if (err) {
            console.error('[%s] findByQuery ERROR: [%s]', whoami, err)
            errcb(err);
        } else {
            cb(entities);
        }
    });
};


/**
 * find by ID
 * @param id
 * @param cb
 * @param errcb
 */
exports.findById = function(id, errcb, cb) {

    Record.findById(id, function(err, entity) {
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
exports.update = function(id, record, errcb, cb) {

    Record.findByIdAndUpdate(id, record, { new: true }, function(err, entity) {
        if (err) {
            console.error('[%s] validation error as validate() argument', whoami)
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
exports.create = function(record, errcb, cb) {
    delete record._id;

    Record.create(record, function(err, entity) {
        if (err) {
            console.error('[%s] validation error as validate() argument ', whoami)
            err.itsme = whoami;
            errcb(err);

        } else {
            cb(entity);
        }
    });

};
