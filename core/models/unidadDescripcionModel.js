/**
 * Exportación a Excel: línea 608
 */

const whoami = "models/unidadDescripcionModel: ";

const mongoose = require('mongoose');
const diffHistory = require('mongoose-diff-history/diffHistory');
const Schema = mongoose.Schema;

const config = require('../config/config');
const utils = require('../services/commons.utils');
const Excel = require('exceljs');

const assetModel = require('./assetModel');

const languageServices = require('../services/languageutils');

/** Constantes necesaria para popular la key company */
const AGN = 'AGN';
const AR = 'AR';
/** Servicio de ATOM */
const atomService = require('../services/atom');
const ESTADO_GESTION_DOC_INACTIVO = 'inactivo';

const LIMIT = 500;

const analiticoSerivce = require('../models/auxiliarymodels/analiticoCyCModel');
const AnaliticoModel = analiticoSerivce.AnaliticoModel;


const constants = require('../constants');

class ApareoUda {
  idUda;
  idParent;
  title;
  identifier;
  reference_code = [];
  isIngestado;
  level_of_description;
  assetIds = [];
  estado;
  actions = [];

  constructor(uda, idParent = null) {
    this.idParent = idParent;

    this.idUda = uda._id;
    this.isIngestado = (uda.audit && uda.audit.isIngestado) || false;
    this.estado = uda.estado;

    if (uda.identificador) {
      this.title = uda.identificador.title;
      this.identifier = uda.identificador.identifier;
      this.reference_code = uda.identificador.reference_code;
      this.level_of_description = uda.identificador.level_of_description;
    }

    if (uda.assets && uda.assets.length) {
      this.assetIds = uda.assets.map((asset) => asset.entityId);
      this.assets = uda.assets;
    }

    if (uda.actions && uda.actions.length)
      this.actions = uda.actions;
  }
}

class UdAssets {
  idParent;
  title;
  reference_code = [];
  level_of_description;
  assetIds = [];

  // Booleano; true si la UDC tiene PDF, false en otro caso
  hasPDF;

  constructor(uda, idParent = null, hasPDF = false) {
    this.idParent = idParent;
    this.idUda = uda._id;
    this.hasPDF = hasPDF;
    if (uda.identificador) {
      this.title = uda.identificador.title;
      this.reference_code = uda.identificador.reference_code;
      this.level_of_description = uda.identificador.level_of_description;
    }
    if (uda.assets && uda.assets.length) {
      this.assetIds = uda.assets.map((asset) => asset.entityId);
    }

  }
}

const assetSch = new mongoose.Schema({
  entity: { type: String, required: false, default: "" },
  displayAs: { type: String, required: false, default: "" },
  predicate: { type: String, required: false, default: "" },
  slug: { type: String, required: false, default: "" },
  description: { type: String, required: false, default: "" },
  avatar: { type: Number, required: false, default: "" },
  entityId: { type: String, required: false, default: "" },
  mimetype: { type: String, required: false, default: "" }
});

const parentSch = new Schema({
  id_parent: { type: String, required: false },
  identifier: { type: String, required: false },
  level_of_description: { type: String, required: false },
  reference_code: { type: [String], required: false },
  title: { type: String, required: false },
  parentAtomSlug: { type: String, required: false, default: '' },
  relacionActualizada: { type: String, required: false, default: '' }
})

const childrenSch = new Schema({
  id_children: { type: String, required: false },
  identifier: { type: String, required: false },
  level_of_description: { type: String, required: false },
  reference_code: { type: [String], required: false },
  title: { type: String, required: false },
  childrenAtomSlug: { type: String, required: false, default: '' }
})

const dateSch = new Schema({
  type: { type: String, required: false },
  date: { type: String, required: false },
  start_date: { type: String, required: false },
  start_date_ts: { type: Number, required: false },
  end_date: { type: String, required: false },
  end_date_ts: { type: Number, required: false },
  observacion: { type: String, required: false }
})

const identificadorSch = new Schema({
  identifier: { type: String, required: false },
  reference_code: { type: [String], required: false },
  level_of_description: { type: String, required: false },
  title: { type: String, required: false },
  extent_and_medium: { type: String, required: false },
  dates: [dateSch],
  alternative_identifiers: { type: [String], required:false, default: []},
  alternative_identifier_labels: { type: [String], required:false, default: []},
})

const especifSch = new Schema({
  system_of_arrangement: { type: String, required: false },
  type: { type: String, required: false }
})

const contentAndStructureSch = new Schema({
  action: { type: String, required: false },
  appraisal_destruction_and_scheduling: { type: String, required: false },
  scope_and_content: { type: String, required: false },
  contenido: { type: String, required: false },
  isAcumulacion: { type: Boolean, required: false, default: false },
  accruals: { type: String, required: false },
  especificaciones: { type: [especifSch], required: false, default: [] }
})

const companySch = new Schema({
  authorityRecordId: { type: String, required: false },
  displayName: { type: String, required: false },
  countryPrefix: { type: String, required: false },
  identifier: { type: String, required: false }
});

const unidadDescripcionAuditSch = new Schema({
  navance: { type: String, required: true, default: 'emitido' },
  creationDate: { type: String, required: false, default: utils.dateToStr(new Date()) },
  creationDateTs: { type: Number, required: false, default: utils.dateNumFromTx(utils.dateToStr(new Date())) },
  creationUserID: { type: String, required: false, default: null },
  creationUsername: { type: String, required: false, default: null },
  creationUserEmail: { type: String, required: false, default: null },
  isIngestado: { type: Boolean, required: false, default: false },
  lastModifiedDate: { type: String, required: false, default: null },
  lastModifiedDateTs: { type: Number, required: false, default: null },
  lastModifiedUserID: { type: String, required: false, default: null },
  lastModifiedUsername: { type: String, required: false, default: null },
  lastModifiedUserEmail: { type: String, required: false, default: null },
  lastModifiedReason: { type: String, required: false, default: null },
  procedureTxt: { type: String, required: false, default: null },

  inventario: { type: String, required: false, default: null },
  
  /**
   * Determina si el registro ya forma parte de una exportación para AtoM
   */
  transferidoAtom: { type: Boolean, required: false, default: false },
  
  /**
   * Usuario que realizó una exportación a AtoM para esta UDA
   */
  transferidoAtomUsuario: { type: String, required: false, default: '' },

  /**
   * Timestamp en que se realizó una exportación a AtoM para esta UDA
   */
  transferidoAtomTimestamp: { type: Number, required: false, default: null },

  numLoteImportacion: { type: String, required: false, default: null },
});

const accesoYUsoSch = new Schema({
  conditions_governing_access: { type: String, required: false },
  conditions_governing_reproduction: { type: String, required: false },
  languages_of_material: { type: [String], required: false, default: [] },
  scripts_of_material: { type: [String], required: false, default: [] },
  notas: { type: String, required: false },
  physical_characteristics_and_technical_requirements: { type: String, required: false },
  finding_aids: { type: String, required: false }
})

const documentacionAsociadaSch = new Schema({
  existence_and_location_of_originals: { type: String, required: false },
  existence_and_location_of_copies: { type: String, required: false },
  related_units_of_description: { type: String, required: false },
  related_descriptions: { type: String, required: false },
  publication_notes: { type: [String], required: false }
})

/**
 * Área de contexto
 */
const contextCreatorSch = new Schema({
  authorityRecordId: { type: String, required: false, default: null },
  authorityRecordName: { type: String, required: false, default: null },
  authorityRecordIdentifier: { type: String, required: false, default: null }
});

const contextArchivalInstitutionSch = new Schema({
  authorityRecordId: { type: String, required: false, default: null },
  authorityRecordName: { type: String, required: false, default: null },
  authorityRecordIdentifier: { type: String, required: false, default: null }
});

const contextAreaSch = new Schema({
  creators: { type: [contextCreatorSch], required: false, default: [] },
  archival_history: { type: String, required: false, default: null },
  repository: { type: String, required: false, default: null },
  immediate_source_of_acquisition_or_transfer: { type: String, required: false, default: null }
});

const ingestProxySch = new Schema({
  ingestProcessId: { type: String, required: false, default: null },
  slug: { type: String, required: false, default: null },
  compNum: { type: Number, required: false, default: null }
});

const actionUdaSch = new Schema({
  type: { type: String, required: false, default: null },
  actionId: { type: String, required: false, default: null },
  fe_tx: { type: String, required: false, default: null },
  fe_ts: { type: Number, required: false, default: null },
  userId: { type: String, required: false, default: null },
  userName: { type: String, required: false, default: null },
  role: { type: String, required: false, default: null },
})

const controlDeLaDescripcionSch = new Schema({
  description_identifier: { type: String, required: false, default: null },
  institution_identifier: { type: String, required: false, default: null },
  rules_and_or_conventions_used: { type: String, required: false, default: null },
  status: { type: String, required: false, default: null },
  level_of_detail: { type: String, required: false, default: null },
  "Dates of creation revision deletion": { type: String, required: false, default: null },
  physical_characteristics_and_technical_requirements: { type: String, required: false, default: null },
  languages_of_description: { type: [String], required: false, default: [] },
  scripts_of_description: { type: [String], required: false, default: [] },
  archivists_notes: { type: [String], required: false, default: [] },
  publication_status: { type: String, required: false, default: null }
})

const puntosAccesoSch = new Schema({
  place_access_points: { type: [String], required: false, default: [] },
  name_access_points: { type: [String], required: false, default: [] },
  subject_access_points: { type: [String], required: false, default: [] },
  genre_access_points: { type: [String], required: false, default: [] }
})

const unidadDescripcionSch = new Schema({
  identificador: { type: identificadorSch, required: false, default: {} },
  contexto: { type: contextAreaSch, required: false, default: {} },
  contenidoYEstructura: { type: contentAndStructureSch, required: false, default: {} },
  accesoYUso: { type: accesoYUsoSch, required: false, default: {} },
  notes: { type: [String], required: false, default: [] },
  documentacionAsociada: { type: documentacionAsociadaSch, required: false, default: {} },
  controlDeLaDescripcion: { type: controlDeLaDescripcionSch, required: false, default: {} },
  puntoAcceso: { type: puntosAccesoSch, required: false, default: {} },

  dataWord: { type: String, required: false },
  assets: [assetSch],
  parent: { type: parentSch, required: false },
  audit: { type: unidadDescripcionAuditSch, required: false, default: {} },

  company: { type: companySch, required: false, default: {} },

  /* Properties relacionadas con el proceso de ingesta */
  ingest: { type: [ingestProxySch], required: false, default: [] },
  stringify: { type: String, required: false, default: '' },

  estado: { type: String, required: true, default: 'activo' },
  /** Slug en AtoM, para UDAs importadas desde allí */
  atomSlug: { type: String, required: false, default: '' },
  /** Si la UDA fue importada desde AtoM, se valoriza a 'true' */
  isAtom: { type: Boolean, required: false, default: false },

  /** Se encarga de hacer seguimiento de las acciones producidas en esa UDA */
  actions: { type: [actionUdaSch], required: false, default: [] }
});

unidadDescripcionSch.plugin(diffHistory.plugin);

exports.unidadDescripcionSch = unidadDescripcionSch;

exports.childrenSch = childrenSch;

const Record = mongoose.model('UnidadDescripcion', unidadDescripcionSch, 'unidadesdescripcion');
exports.GestionDocRecord = Record;


function buildQuery(query) {
  let q = {};

  /***
   * viene de VIDA
   */
  if (query && query.isArray === 'true') {
    q['$and'] = [];
    for (let index = 0; index < query.termino.length; index++) {
      let qry = {
        termino: query.termino[index],
        buscarEn: query.buscarEn[index],
        tipoBusqueda: query.tipoBusqueda[index],
        recurso: query.recurso
      }
      q['$and'].push(refactorQuery(qry));
    }
    return q;
  }

  if (query && query.recurso === '3') {
    q = refactorQuery(query);
    return q;
  }

  /***
   * viene de BUSCADOR ADMIN
   */
  if (query.descriptionlevel) {
    q['identificador.level_of_description'] = query.descriptionlevel;
  }

  if (query.title) {
    q['identificador.title'] = { '$regex': query.title, '$options': 'ig' };
  }

  if (query.identifier) {
    q['identificador.identifier'] = { '$regex': query.identifier, '$options': 'ig' };
  }

  if (query.estado) {
    q['estado'] = query.estado;
  }

  if (query.navance) {
    q['audit.navance'] = query.navance;
  }

  if (query.inventario) {
    q['audit.inventario'] = query.inventario;
  }

  if (query.parent) {
    q['parent.id_parent'] = query.parent;
  }

  if (query.parentIdentifier) {
    q['parent.identifier'] = { '$regex': query.parentIdentifier, '$options': 'ig' };
  }

  if (query.codigo_referencia) {
    // q['identificador.codigo_referencia'] = { '$all': query.codigo_referencia.toUpperCase().split(' ') };
    q['identificador.reference_code'] = { '$all': query.codigo_referencia.split(' ') };
  }

  if (query.codigo_referencia_exact) {
    // q['identificador.codigo_referencia'] = { '$eq': query.codigo_referencia_exact.split(' ') };
    q['identificador.reference_code'] = { '$eq': query.codigo_referencia_exact.split(' ') };
  }

  if (query.ingest) {
    q['ingest.ingestProcessId'] = { '$in': query.ingest };
  }

  if (query.isAtom) {
    q['isAtom'] = query.isAtom;
  }

  if (query.transferidoAtom) {
    q['audit.transferidoAtom'] = query.transferidoAtom;
  }

  return q;
}

function refactorQuery(query) {
  let q = {};


  // Stringify (Todos los campos)
  if (query.buscarEn === 'all') {
    q['stringify'] = buildFiltroStringify(query.termino, query.tipoBusqueda);
  }

  // Título (palabra completa)
  if (query.buscarEn === 'alltext') {
    q['$text'] = buildTextSearch(query.termino, query.tipoBusqueda);
  }

  if (query.buscarEn === 'anio_creacion') {
    buildFiltroBusquedaYear(q, query.termino, query.tipoBusqueda);
  }

  if (query.buscarEn === 'tesaurolug') {
    buildFiltroTesauro(q, query.termino, query.buscarEn);
  }
  if (query.buscarEn === 'tesauromat') {
    buildFiltroTesauro(q, query.termino, query.buscarEn);
  }
  if (query.buscarEn === 'tesauroaut') {
    buildFiltroTesauro(q, query.termino, query.buscarEn);
  }
  if (query.buscarEn === 'tesauronom') {
    buildFiltroTesauro(q, query.termino, query.buscarEn);
  }
  // if(query.buscarEn === 'anio_produccion') {
  //   buildFiltroBusquedaYearProduccion(q, query.termino, query.tipoBusqueda);
  // }

  // Descripción (documento)
  // if (query.buscarEn === 'document') {
  //     q['documentos.contents'] = buildFiltroBusquedaTexto(query.termino, query.tipoBusqueda);
  // }

  // Reference_code
  if (query.buscarEn === 'reference_code') {
    if (query.tipoBusqueda === 'exact') {
      q['identificador.reference_code'] = { '$eq': query.termino.split('-') };

    } else {
      q['identificador.reference_code'] = { '$all': query.termino.split('-') };

    }
  }

  // Serie (titulo de la serie)
  if (query.buscarEn === 'titulo_serie') {
    q['identificador.title'] = buildFiltroBusquedaTexto(query.termino, query.tipoBusqueda);
  }

  // Título
  if (query.buscarEn === 'title') {
    q['identificador.title'] = buildFiltroBusquedaTexto(query.termino, query.tipoBusqueda);
  }



  return q;
}
/************************************************
 * MÉTODOS PRIVADOS
 *
 */

function buildTextSearch(termino, tipoBusqueda) {
  // return { '$search': termino, '$language': 'es', '$caseSensitive': false, '$diacriticSensitive': false };
  return { '$search': termino, '$caseSensitive': false, '$diacriticSensitive': false };
}

function buildFiltroTesauro(q, termino, buscarEn) {
  if (buscarEn === 'tesauromat') q['puntoAcceso.subject_access_points'] = termino;
  if (buscarEn === 'tesaurolug') q['puntoAcceso.place_access_points'] = termino;
  if (buscarEn === 'tesauronom') q['puntoAcceso.name_access_points'] = termino;
  if (buscarEn === 'tesauroaut') q['puntoAcceso.genre_access_points'] = termino;
}

function buildFiltroBusquedaYear(q, termino, tipoFecha) {
  let anio = Number.parseInt(termino);
  if (isNaN(anio)) return;
  let fedesde_ts = new Date(anio, 0, 1).getTime();
  let fehasta_ts = new Date(anio, 11, 31).getTime();

  q['identificador.dates.start_date_ts'] = { "$lt": fedesde_ts }
  q['identificador.dates.end_date_ts'] = { "$gte": fehasta_ts }

}

function buildFiltroBusquedaYearProduccion(q, termino, tipoFecha) {
  // let anio = Number.parseInt(termino);
  // if(isNaN(anio)) return;
  // let fedesde_ts = new Date(anio, 0, 1).getTime();
  // let fehasta_ts = new Date(anio,11, 31).getTime();

  // q['identificador.dates.start_date_ts'] = { "$lt": fedesde_ts }
  // q['identificador.dates.end_date_ts'] = { "$gte": fehasta_ts }

}

function buildFiltroBusquedaTexto(termino, tipoBusqueda) {
  if (tipoBusqueda === 'aprox') {
    // Si la frase tiene dos o mas terminos, cambia la logica de busqueda

    let normalized = utils.normalizeSpaces(termino);

    if (normalized.indexOf(' ') !== -1) {

      let multiw = utils.buildMultiWord(normalized)

      return { '$regex': utils.buildVowelsSingleWord(multiw), '$options': 'ig' };

    } else {

      return { '$regex': utils.buildVowelsSingleWord(normalized), '$options': 'ig' };

    }
  } else {
    return { '$regex': '\\b(' + utils.buildVowelsRegexp(termino) + ')\\b', '$options': 'ig' }; // termino;
  }
}

function buildFiltroStringify(termino, tipoBusqueda) {
  termino = utils.safeTextSearch(termino);

  if (tipoBusqueda === 'aprox') {
    // Si la frase tiene dos o mas terminos, cambia la logica de busqueda

    let normalized = utils.normalizeSpaces(termino);

    if (normalized.indexOf(' ') !== -1) {
      let multiw = utils.buildMultiWord(normalized)
      return { '$regex': utils.buildVowelsSingleWord(multiw), '$options': 'ig' };

    } else {

      return { '$regex': utils.buildVowelsSingleWord(normalized), '$options': 'ig' };
    }
  } else {
    return { '$regex': '\\b(' + termino + ')\\b', '$options': 'ig' }; // termino;
  }
}



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
 *
 * @param {*} udaId la UD de referencia para buscar hijos directos
 * @param {*} errcb
 * @param {*} cb
 * retorna un array de ChildrenUD
 */
exports.fetchChildren = function (udaId, errcb, cb) {
  let query = {
    'parent.id_parent': udaId,
    estado: 'activo'
  }

  Record.find(query).select('identificador atomSlug').lean().exec().then(records => {
    let children = []
    if ((records && records.length)) {
      children = records.map(t => {
        return {
          id_children: t._id,
          identifier: t.identificador.identifier,
          level_of_description: t.identificador.level_of_description,
          reference_code: t.identificador.reference_code,
          title: t.identificador.title,
          childrenAtomSlug: t.atomSlug
        }
      })
    }
    cb(children);
  })
};



/**
 * Retrieve records from query /search/?name=something
 * @param cb
 * @param errcb
 */
exports.findByQuery = function (query, errcb, cb) {
  let regexQuery = buildQuery(query)


  Record.find(regexQuery, function (err, entities) {
    if (err) {
      console.error('[%s] findByQuery ERROR: [%s]', whoami, err)
      errcb(err);
    } else {
      cb(entities);
    }
  }).limit(LIMIT);

};








//-----------------------------------------------------------------------------
// INICIO EXPORTACIÓN A EXCEL
//-----------------------------------------------------------------------------

const reporteFuncionGeneradora = {
  'ATOM-ALTA': _construirReporteAtomAlta,
  'NODOS-ISAD-G': _construirReporteAtomAlta //TODO: Reemplazar por exportación de nodos isad g
};



/**
 * Descarga un archivo de Excel preparado para importar dentro de AtoM
 * La búsqueda de registros se hace a partir del timestamp proporcionado por parámetro
 * 
 * @param {*} timestamp 
 * @param {*} req 
 * @param {*} res 
 */
exports.exportarExcelParaAtom = async function(timestamp, req, res) {
  const query = {};

  // Los registros deben formar parte de una transferencia
  query['audit.transferidoAtom'] = true;
  // Los registros no deben haberse importado desde AtoM
  query['isAtom'] = false;
  // El timestamp debe coincidir con el proporcionado por parámetro
  query['audit.transferidoAtomTimestamp'] = timestamp;

  try {
    const entities = await Record.find(query).lean().exec();
    if (entities && entities.length > 0) {
      _generarArchivoDeExcel('ATOM-ALTA', timestamp, entities, req, res);
    } else {
      _generarArchivoDeExcel('ATOM-ALTA', timestamp, [], res, res);
    }
  } catch(error) {
    throw error;
  }
}




exports.prepararExcelParaAtom = function (query, req, res) {
  return obtenerYMarcarMovimientos(query, req, res);
}



async function obtenerYMarcarMovimientos(query, req, res) {
  // Timestamp en que se realiza la exportación
  // Se va pasando de función en función, porque tiene que ser el mismo durante toda la 
  // pila de llamadas
  const timestamp = Date.now();
  
  const regexQuery = buildQuery(query);
  
  // Excluir los registros ya cargados en una importación anterior
  regexQuery['audit.transferidoAtom'] = false;
  
  // Excluir los registros provenientes originalmente de AtoM
  regexQuery['isAtom'] = false;

  try {
    const entities = await Record.find(regexQuery).lean().exec();

    if (entities && entities.length) {
      return _actualizarRegistroParaAtom(entities, timestamp, req.user.username, true);
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
}


/**
 * Actualiza un conjunto de registros, marcándolos migrados hacia AtoM
 * Retorna la cantidad de elementos actualizados y el timestamp en que se realizó el marcado
 * 
 * @param {*} entities 
 * @param {*} timestamp 
 * @param {*} usuario 
 * @param {*} transferidoAtom 
 * @returns 
 */
async function _actualizarRegistroParaAtom(entities, timestamp, usuario, transferidoAtom = false) {
  const records = entities.map(entity => entity._id);

  const filter = {
    '_id': {
      '$in': records
    }
  };

  const actualizacion = { 
    'audit.transferidoAtom': transferidoAtom,
    'audit.transferidoAtomTimestamp': timestamp,
    'audit.transferidoAtomUsuario': usuario
  };

  try {
    const resultado = await Record.updateMany(filter, actualizacion).lean().exec();
    if (resultado.ok === 1) {
      return { timestamp, cantidad: resultado.nModified };
    }
  } catch(error) {
    throw error;
  }
}


function _generarArchivoDeExcel(reporte, timestamp, entities, req, res) {
  reporteFuncionGeneradora[reporte](entities, timestamp, req, res);
}



async function _construirReporteAtomAlta(entities, timestamp, req, res) {
  const atomAltaArray = [];
  const ahora = new Date();
  
  for (let k = 0; k < entities.length; k++) {
    const {
      _id,
      identificador,
      contexto,
      contenidoYEstructura,
      accesoYUso,
      documentacionAsociada,
      controlDeLaDescripcion,
      assets,
      parent
    } = entities[k];

    /* ----------------------------------
      * Mapeo los lenguajes que las UDAs almacenan, al formato entendido por AtoM
      * ----------------------------------
      */
    let eventType = [];
    eventType['Creación'] = 'Creación';
    eventType['Creacion'] = 'Creación';
    eventType['creacion'] = 'Creación';
    eventType['Predominantes'] = 'Predominantes';
    eventType['predominantes'] = 'Predominantes';
    eventType['Acumulación'] = 'Acumulación';
    eventType['Acumulacion'] = 'Acumulación';
    eventType['acumulacion'] = 'Acumulación';

    let levelsOfDescription = [];
    levelsOfDescription['serie'] = 'Serie';
    levelsOfDescription['subserie'] = 'Subserie';
    levelsOfDescription['part'] = 'Parte';
    levelsOfDescription['fondo'] = 'Fondo';
    levelsOfDescription['subfondo'] = 'Subfondo';
    levelsOfDescription['coleccion'] = 'Colección';
    levelsOfDescription['unidad documental'] = 'Unidad documental compuesta';
    levelsOfDescription['unidad documental compuesta'] = 'Unidad documental compuesta';
    levelsOfDescription['unidad documental simple'] = 'Unidad documental simple';
    levelsOfDescription['item'] = 'Unidad documental simple';
    levelsOfDescription['serie facticia'] = 'Serie facticia';
    levelsOfDescription['seccion'] = 'Sección';

    let levelsOfDetail = [];
    levelsOfDetail['Parcial'] = 'partial';
    levelsOfDetail['Completo'] = 'full';
    levelsOfDetail['Básico'] = 'minimal';

    const udaId = _id.toString().replace('"', '');


    const udaParaExcel = {
      legacyId: udaId,        
      parentId: parent.id_parent || '',
      qubitParentSlug: '',
      identifier: identificador.identifier || '',
      title: identificador.title || '',
      levelOfDescription: identificador.level_of_description ? levelsOfDescription[identificador.level_of_description] : '',
      extentAndMedium: identificador.extent_and_medium || '',
      repository: contexto.repository || '',
      archivalHistory: contexto.archival_history || '',
      acquisition: contexto.immediate_source_of_acquisition || '',
      scopeAndContent: contenidoYEstructura.scope_and_content || '',
      appraisal: contenidoYEstructura.appraisal_destruction_and_scheduling || '',
      accruals: (contenidoYEstructura.isAcumulacion === true) ? contenidoYEstructura.accruals : '',
      accessConditions: accesoYUso.conditions_governing_access || '',
      reproductionConditions: accesoYUso.conditions_governing_reproduction || '',
      language: accesoYUso.languages_of_material && accesoYUso.languages_of_material.length ? accesoYUso.languages_of_material.map(lang => languageServices.convertLanguageNameToISO639(lang)).join('|') : '',
      script: accesoYUso.scripts_of_material && accesoYUso.scripts_of_material.length ? accesoYUso.scripts_of_material.map(script => languageServices.convertLanguageNameToISO15924(script)).join('|') : '',
      physicalCharacteristics: accesoYUso.physical_characteristics_and_technical_requirements || '',
      findingAids: accesoYUso.finding_aids || '',
      locationOfOriginals: documentacionAsociada.existence_and_location_of_originals || '',
      locationOfCopies: documentacionAsociada.existence_and_location_of_copies || '',
      relatedUnitsOfDescription: documentacionAsociada.related_descriptions || '',
      digitalObjectURI: '',
      descriptionIdentifier: controlDeLaDescripcion.description_identifier || '',
      institutionIdentifier: controlDeLaDescripcion.institution_identifier || '',
      rules: controlDeLaDescripcion.rules_and_or_conventions_used || '',
      descriptionStatus: controlDeLaDescripcion.status || '',
      levelOfDetail: controlDeLaDescripcion.level_of_detal ? levelsOfDetail[controlDeLaDescripcion.level_of_detail] : '',
      languageOfDescription: controlDeLaDescripcion.languages_of_description && controlDeLaDescripcion.languages_of_description.length ? controlDeLaDescripcion.languages_of_description.map(lang => languageServices.convertLanguageNameToISO639(lang)).join('|') : '',
      scriptOfDescription: controlDeLaDescripcion.scripts_of_description && controlDeLaDescripcion.scripts_of_description.length ? controlDeLaDescripcion.scripts_of_description.map(script => languageServices.convertLanguageNameToISO15924(script)).join('|') : '',
      archivistNote: controlDeLaDescripcion.archivists_notes && controlDeLaDescripcion.archivists_notes.length ? controlDeLaDescripcion.archivists_notes.join('\r\n'):  '',
      publicationStatus: 'Borrador',

      // Esto lo usaremos para identificar el registro cuando "vuelva" a GDoc
      alternativeIdentifiers: udaId + '|' + utils.dateToStr(ahora),
      alternativeIdentifierLabels: 'gestiondoc|gestiondoc-fecha'
    };

    // Generación de la URI hacia el objeto digital asociado, si existe
    if (assets && assets.length > 0) {
      let uri = '';

      // Obtengo los datos del asset
      try {
        const asset = await assetModel.getMongooseModel().findById(assets[0].entityId);

        if (asset) {
          // Genero el URI; assetPath ya contiene la / inicial
          const assetPath = await assetModel.asyncFindDownloadRouteById(asset._id);
          uri = `${constants.digitalObjectURIHostname}${assetPath}`;
          
        }
      } catch (error) {
        console.error(error);
      }

      // Lo almaceno en la key digitalObjectURI
      udaParaExcel.digitalObjectURI = uri;
    }

    let tieneAlgunaFecha = false;

    if (identificador.dates && identificador.dates.length > 0) {
      if (!tieneAlgunaFecha)
      {
        udaParaExcel['eventDates'] = identificador && identificador.dates && identificador.dates[0].date || '';
        udaParaExcel['eventTypes'] = (identificador && identificador.dates && identificador.dates[0]) ? eventType[identificador.dates[0].type] : '';
        udaParaExcel['eventStartDates'] = identificador && identificador.dates && identificador.dates[0].start_date || '';
        udaParaExcel['eventEndDates'] = identificador && identificador.dates && identificador.dates[0].end_date || '';
        tieneAlgunaFecha = true;
      } else {
        udaParaExcel['eventDates'] += '|'+identificador && identificador.dates && identificador.dates[0].date || '';
        udaParaExcel['eventTypes'] += '|'+(identificador && identificador.dates && identificador.dates[0]) ? eventType[identificador.dates[0].type] : '';
        udaParaExcel['eventStartDates'] += '|'+ identificador && identificador.dates && identificador.dates[0].start_date || '';
        udaParaExcel['eventEndDates'] += '|'+ identificador && identificador.dates && identificador.dates[0].end_date || '';
      }
    }


    // "culture" es un campo requerido (según indicación de Uviña), por lo tanto siempre lo valorizamos a 'es'
    // Es el idioma por defecto para la descripción archivística que se está importando
    udaParaExcel['culture'] = 'es';

    // Nota de migración
    
    if (udaParaExcel.archivistNote.length > 0) {
      udaParaExcel.archivistNote += '\r\nRegistro migrado desde GestionDoc el ' + utils.dateToStr(ahora) + ' a las ' + utils.txFromHora(ahora);
    } else {
      udaParaExcel.archivistNote = '\r\nRegistro migrado desde GestionDoc el ' + utils.dateToStr(ahora) + ' a las ' + utils.txFromHora(ahora);
    }

    atomAltaArray.push(udaParaExcel);
  }
  

  if (atomAltaArray) {
    _exportarAExcel(atomAltaArray, timestamp, req, res);
  }
}


function _exportarAExcel(registros, timestamp, req, res) {
  const archivoSalida = 'reporte_atom_alta_' + timestamp + '.xlsx';



  res.writeHead(200, {
    'Content-Disposition': 'attachment; filename="' + archivoSalida + '"',
    'Transfer-Encoding': 'chunked',
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });



  const libro = new Excel.stream.xlsx.WorkbookWriter({ stream: res });
  const hoja = libro.addWorksheet('registros');

  

  hoja.addRow([
    'legacyId',
    'parentId',
    'qubitParentSlug',
    'identifier',
    'title',
    'levelOfDescription',
    'extentAndMedium',
    'repository',
    'archivalHistory',
    'acquisition',
    'scopeAndContent',
    'appraisal',
    'accruals',
    'accessConditions',
    'reproductionConditions',
    'physicalCharacteristics',
    'findingAids',
    'locationOfOriginals',
    'locationOfCopies',
    'relatedUnitsOfDescription',
    'digitalObjectPath',
    'digitalObjectURI',
    'descriptionIdentifier',
    'institutionIdentifier',
    'rules',
    'descriptionStatus',
    'levelOfDetail',
    'language',
    'script',
    'languageOfDescription',
    'scriptOfDescription',
    'archivistNote',
    'publicationStatus',
    'alternativeIdentifiers',
    'alternativeIdentifierLabels',
    'eventDates',
    'eventTypes',
    'eventStartDates',
    'eventEndDates',
    'culture'
  ]).commit();


  registros.forEach(registro => {
    const {
      legacyId,
      parentId,
      qubitParentSlug,
      identifier,
      title,
      levelOfDescription,
      extentAndMedium,
      repository,
      archivalHistory,
      acquisition,
      scopeAndContent,
      appraisal,
      accruals,
      accessConditions,
      reproductionConditions,
      physicalCharacteristics,
      findingAids,
      locationOfOriginals,
      locationOfCopies,
      relatedUnitsOfDescription,
      digitalObjectPath,
      digitalObjectURI,
      descriptionIdentifier,
      institutionIdentifier,
      rules,
      descriptionStatus,
      levelOfDetail,
      language,
      script,
      languageOfDescription,
      scriptOfDescription,
      archivistNote,
      publicationStatus,
      eventDates,
      eventTypes,
      eventStartDates,
      eventEndDates,
      culture,
      alternativeIdentifiers,
      alternativeIdentifierLabels
    } = registro;


    hoja.addRow([
      legacyId,
      parentId,
      qubitParentSlug,
      identifier,
      title,
      levelOfDescription,
      extentAndMedium,
      repository,
      archivalHistory,
      acquisition,
      scopeAndContent,
      appraisal,
      accruals,
      accessConditions,
      reproductionConditions,
      physicalCharacteristics,
      findingAids,
      locationOfOriginals,
      locationOfCopies,
      relatedUnitsOfDescription,
      digitalObjectPath,
      digitalObjectURI,
      descriptionIdentifier,
      institutionIdentifier,
      rules,
      descriptionStatus,
      levelOfDetail,
      language,
      script,
      languageOfDescription,
      scriptOfDescription,
      archivistNote,
      publicationStatus,
      alternativeIdentifiers,
      alternativeIdentifierLabels,
      eventDates,
      eventTypes,
      eventStartDates,
      eventEndDates,
      culture
    ]).commit();
  });

  hoja.commit();
  libro.commit();
}

//-----------------------------------------------------------------------------
// FIN EXPORTACIÓN A EXCEL
//-----------------------------------------------------------------------------






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
  record.stringify = buildStringifyField(record);

  const updatingUser = record.audit.lastModifiedUsername;
  const updatingReason = record.audit.lastModifiedReason || '(sin novedad)';

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

  record.stringify = buildStringifyField(record);

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


/**
 * Eliminación en lote de unidades de descripción archivística.
 *
 * Pre: el parámetro 'records' debe ser un array no-vacío de IDs (Mongo)
 *      correspondientes a las UDAs que se desea eliminar
 * Post: las entidades eliminadas
 */
exports.deleteMany = function (records, errorCallback, successCallback) {

  if (records && records.length > 0) {
    const filter = {
      '_id': {
        '$in': records
      }
    };

    Record.deleteMany(filter, function (error, entities) {
      if (error) {
        errorCallback(error);
      } else {
        successCallback(entities);
      }
    });
  } else {
    errorCallback({ error: 'Nothing to delete here' });
  }

}

/**
 * Devuelve el historial para el documento con el ID (de Mongo) proporcionado
 *
 * @param string El ID del documento cuyo historial se quiere recuperar
 *
 */
exports.fetchHistory = function (docId, errorCb, historyCb) {
  diffHistory
    .getHistories('UnidadDescripcion', docId)
    .then(histories => {
      historyCb(histories);

    }).catch(error => {
      console.error(error);
      errorCb(error);
    });
}

/**
 * Obtiene la lista de instrucciones de DIGITALIZACIÓN, remontando la jerarquia
 * @param {*} id
 * @param {*} errCb
 * @param {*} succesCb
 */
exports.initProcedureTxt = function (id, errCb, succesCb) {
  var array = new Array();
  processProcedureTxt(id, array, errCb, succesCb);
}

const processProcedureTxt = async function (id, array, errCb, succesCb) {
  let actualUDA = await Record.findById(id).lean().exec();

  _addProcedureToArrayList(array, actualUDA);

  if (actualUDA.parent && actualUDA.parent.id_parent) {
    processProcedureTxt(actualUDA.parent.id_parent, array, errCb, succesCb);

  } else {
    succesCb(array);
  }
}

const _addProcedureToArrayList = function (array, actualUDA) {
  if (actualUDA.audit && actualUDA.audit.procedureTxt) {
    array.push(actualUDA.audit.procedureTxt);
  }
}


/**
 *
 * @param {*} id
 * @param {*} errCb
 * @param {*} succesCb
 */
exports.buildJerarquiaMap = function (id, errCb, succesCb) {
  let map = new Map();
  processJerarquia(id, map, errCb, succesCb)
}

const processJerarquia = async function (id, map, errCb, succesCb) {
  let actualUDA = await Record.findById(id).lean().exec();

  _processToken(map, actualUDA);

  // CRÍTICO: decisión de si continuar la recursión o cortar:
  if (actualUDA.parent && actualUDA.parent.id_parent) {
    processJerarquia(actualUDA.parent.id_parent, map, errCb, succesCb);

  } else {
    let arrFromMap = Array.from(map.values())
    succesCb(arrFromMap);
  }

}

const _processToken = function (map, actualUDA) { //renombrar actualUDA después
  Object.keys(actualUDA).forEach(key => {
    let area = key;
    if (actualUDA[key] && filtros.includes(key)) {

      Object.keys(actualUDA[key]).forEach(identKey => { //identifier, title, etc-
        let mapKey = area + ':' + identKey; //Lo realizamos para construir el mapKey de la optList;
        let token = {
          identifier: actualUDA.identificador.identifier,
          level_of_description: actualUDA.identificador.level_of_description,
          propiedad: identKey,
          mapKey: mapKey,
          id_ud: actualUDA._id,
          value: actualUDA[key][identKey]
        }

        if (map.has(mapKey)) {
          //Encontró el contenido, por ende alteramos el mismo.
          map.get(mapKey).push(token)
        } else {
          //Si no encontro el contenido, hay que inicializarlo.
          map.set(mapKey, [token]);
        }
      })
    }
  })
}

const filtros = ['identificador']; //en este array pushearemos los string que correspondan a las areas que nos interesan filtrar de los Object.keys()


/**
 * Interacción con la API de AtoM
 *
 */
exports.getInformationObjects = function () {
  return atomService.getInformationObjects();
}

exports.getInformationObject = function (slug) {
  return atomService.getInformationObject(slug);
}

exports.UDARecordFactory = (slug, informationObject) => {
  // Creo una nueva UDA vacía
  const record = {
    identificador: {},
    contexto: {},
    contenidoYEstructura: {},
    accesoYUso: {},
    notes: [],
    documentacionAsociada: {},
    controlDeLaDescripcion: {},
    parent: {},
    company: {},
    puntoAcceso: {},
    children: []
  };

  // Área de identificación
  if (informationObject.reference_code) {
    record.identificador.reference_code = informationObject.reference_code.split(/[\s-]/);
    record.identificador.identifier = informationObject.reference_code.split(/[\s-]/).pop();
  } else {
    record.identificador.reference_code = '';
    record.identificador.identifier = '';
  }
  //c onsole.log('level of description: [%s] [%s]',informationObject.level_of_description, utils.safeStringify(informationObject.level_of_description.toLowerCase()) );
  record.identificador.level_of_description = informationObject.level_of_description ? utils.safeStringify(informationObject.level_of_description.toLowerCase()) : '';
  record.identificador.title = informationObject.title || '';
  record.identificador.extent_and_medium = informationObject.extent_and_medium || '';
  if (informationObject.dates && informationObject.dates.length > 0) {
    record.identificador.dates = informationObject.dates.map(theDate => {
      const startDate = theDate.start_date ? utils.parseAtomDateStr(theDate.start_date) : null;
      const endDate = theDate.end_date ? utils.parseAtomDateStr(theDate.end_date) : null;

      return {
        date: theDate.date ? theDate.date : null,
        start_date: theDate.start_date ? utils.getAtomSignificantDate(theDate.start_date) : null,
        start_date_ts: startDate ? startDate.getTime() : 0,
        end_date: theDate.end_date ? utils.getAtomSignificantDate(theDate.end_date) : null,
        end_date_ts: endDate ? endDate.getTime() : 0,
        type: utils.safeStringify(theDate.type)
      }
    });

  } else {
    record.identificador.dates = [];
  }

  // Área de contexto
  record.contexto.archival_history = informationObject.archival_history || '';
  record.contexto.repository = informationObject.repository || '';
  record.contexto.immediate_source_of_acquisition_or_transfer = informationObject.immediate_source_of_acquisition_or_transfer || '';

  if (informationObject && informationObject.creators && informationObject.creators.length) {
    record.contexto.creators = informationObject.creators.map((creator) => {
      return UDACreatorFactory(creator);
    });
  }

  // Company
  /** De momento, se setean con record.contexto.repository
   *  que contiene la forma autorizada del nombre
   * */
  record.company.displayName = record.contexto.repository || '';
  record.company.authorityRecordId = record.contexto.repository || '';
  /** Por defecto, asignamos esos valores a company */
  record.company.identifier = AGN;
  record.company.countryPrefix = AR;


  // Área de contenido y estructura
  record.contenidoYEstructura.scope_and_content = informationObject.scope_and_content || '';
  record.contenidoYEstructura.action = 'no_definido';
  record.contenidoYEstructura.appraisal_destruction_and_scheduling = informationObject.appraisal_destruction_and_scheduling || '';

  record.contenidoYEstructura.accruals = informationObject.accruals;
  if (record.contenidoYEstructura.accruals && record.contenidoYEstructura.accruals.length > 0) {
    record.contenidoYEstructura.isAcumulacion = true;
  }

  record.contenidoYEstructura.especificaciones = [{
    system_of_arrangement: informationObject.system_of_arrangement || '',
    type: 'no_definido'
  }];


  // Área de acceso y uso
  record.accesoYUso.conditions_governing_access = informationObject.conditions_governing_access || '';
  record.accesoYUso.conditions_governing_reproduction = informationObject.conditions_governing_reproduction || '';
  if (informationObject && informationObject.languages_of_material && informationObject.languages_of_material.length) {
    record.accesoYUso.languages_of_material = informationObject.languages_of_material.map(item => utils.mapAtomLanguageToGestionDoc(item));
  } else {
    record.accesoYUso.languages_of_material = [];
  }

  if (informationObject && informationObject.scripts_of_material && informationObject.scripts_of_material.length) {
    record.accesoYUso.scripts_of_material = informationObject.scripts_of_material.map(item => utils.mapAtomLanguageToGestionDoc(item));
  } else {
    record.accesoYUso.scripts_of_material = [];
  }
  record.accesoYUso.physical_characteristics_and_technical_requirements = informationObject.physical_characteristics_and_technical_requirements || '';
  record.accesoYUso.finding_aids = informationObject.finding_aids || '';


  // Área de documentación asociada
  record.documentacionAsociada.existence_and_location_of_originals = informationObject.existence_and_location_of_originals || '';
  record.documentacionAsociada.existence_and_location_of_copies = informationObject.existence_and_location_of_copies || '';
  record.documentacionAsociada.related_units_of_description = informationObject.related_units_of_description || '';

  if (informationObject.related_descriptions) {
    record.documentacionAsociada.related_descriptions = informationObject.related_descriptions.join("\n");
  } else {
    record.documentacionAsociada.related_descriptions = '';
  }

  record.documentacionAsociada.publication_notes = informationObject.publication_notes || '';

  // Área de notas
  record.notes = informationObject.notes || [];

  // Área de control de la descripción

  record.controlDeLaDescripcion.description_identifier = informationObject.description_identifier || '';
  record.controlDeLaDescripcion.institution_identifier = informationObject.institution_identifier || '';
  record.controlDeLaDescripcion.rules_and_or_conventions_used = informationObject.rules_and_or_conventions_used || '';
  record.controlDeLaDescripcion.status = informationObject.status || '';
  record.controlDeLaDescripcion.level_of_detail = informationObject.level_of_detail || '';
  record.controlDeLaDescripcion['Dates of creation revision deletion'] = informationObject['Dates of creation revision deletion'] || '';
  record.controlDeLaDescripcion.physical_characteristics_and_technical_requirements = informationObject.physical_characteristics_and_technical_requirements || '';

  if (informationObject.languages_of_description && informationObject.languages_of_description.length) {

    informationObject.languages_of_description.map(item => utils.mapAtomLanguageToGestionDoc(item))
    record.controlDeLaDescripcion.languages_of_description = informationObject.languages_of_description;
  } else {
    record.controlDeLaDescripcion.languages_of_description = [];
  }
  if (informationObject.scripts_of_description && informationObject.scripts_of_description.length) {
    informationObject.scripts_of_description.map(item => utils.mapAtomLanguageToGestionDoc(item))
    record.controlDeLaDescripcion.scripts_of_description = informationObject.scripts_of_description;
  } else {
    record.controlDeLaDescripcion.scripts_of_description = [];
  }
  if (informationObject.archivists_notes && informationObject.archivists_notes.length) {
    record.controlDeLaDescripcion.archivists_notes = informationObject.archivists_notes;
  } else {
    record.controlDeLaDescripcion.archivists_notes = [];
  }

  // Punto de acceso
  record.puntoAcceso.place_access_points = informationObject.place_access_points && informationObject.place_access_points.length ? informationObject.place_access_points : [];
  record.puntoAcceso.name_access_points = informationObject.name_access_points && informationObject.name_access_points.length ? informationObject.name_access_points : [];
  record.puntoAcceso.subject_access_points = informationObject.subject_access_points && informationObject.subject_access_points.length ? informationObject.subject_access_points : [];
  record.puntoAcceso.genre_access_points = informationObject.genre_access_points && informationObject.genre_access_points.length ? informationObject.genre_access_points : [];



  // Identificadores de AtoM
  record.atomSlug = slug;
  record.isAtom = true;
  record.parent.parentAtomSlug = informationObject.parent || '';
  return record;
}

exports.performMigration = function (slug, informationObject) {
  return Record.findOneAndUpdate({ atomSlug: slug }, this.UDARecordFactory(slug, informationObject), {
    upsert: true,
    new: true
  });
}

/**
 * Fase 3: Actualización de los datos del parent de cada UDA
 */
exports.initSyncParentChild = async () => {

  /**
   * LEVANTAMOS LOS CAMPOS NECESARIOS
   */
  const allUdaGestionDoc = await Record.find().select(['parent', 'identificador', 'atomSlug']).lean().exec();
  const udaGestionDocMap = new Map();

  /** Marca que vamos a utilizar para marcar cuando se actualizó, o cuando falló */
  const dateFromUpdate = utils.dateToStr(new Date());

  console.log('initSyncParentChild toBEGIN [%s]', allUdaGestionDoc && allUdaGestionDoc.length )

  allUdaGestionDoc.forEach(uda => {
    if (uda.estado !== ESTADO_GESTION_DOC_INACTIVO)
      udaGestionDocMap.set(uda.atomSlug, uda);
  });

  for (let [key, udaRecord] of udaGestionDocMap) {
    if (udaRecord.parent && udaRecord.parent.parentAtomSlug) {

      if (udaGestionDocMap.has(udaRecord.parent.parentAtomSlug)) {
        const udaParent = udaGestionDocMap.get(udaRecord.parent.parentAtomSlug);

        /** Completamos la key Parent de udaRecord */
        udaRecord.parent = UDAParentFactory(udaParent, dateFromUpdate);
      } else {
        /** NO ENCONTRAMOS REGISTRO REFERIDO POR EL ATOM-SLUG. Entonces dejamos marca de esto*/
        udaRecord.parent.relacionActualizada = 'Error: atom-parent-slug no encontrado. Proceso: ' + dateFromUpdate;
      }
    }
  }

  let recordsUpdated = 0;
  for (let [key, udaRecord] of udaGestionDocMap) {
    if (udaRecord.parent && udaRecord.parent.parentAtomSlug) {

      recordsUpdated += 1;
      await Record.findByIdAndUpdate(udaRecord._id, {
        identificador: udaRecord.identificador,
        parent: udaRecord.parent,
      });
    }
  }

  return recordsUpdated;
}

const UDAParentFactory = (udaParent, dateFromUpdate) => {
  return {
    id_parent: udaParent._id,
    identifier: udaParent.identificador.identifier,
    level_of_description: udaParent.identificador.level_of_description,
    reference_code: udaParent.identificador.reference_code,
    title: udaParent.identificador.title,
    parentAtomSlug: udaParent.atomSlug,
    relacionActualizada: 'proceso ' + dateFromUpdate
  };
}

const UDACreatorFactory = (atomCreator) => {
  return {
    authorityRecordId: atomCreator.authotized_form_of_name,
    authorityRecordName: atomCreator.authotized_form_of_name,
  }
}

exports.rebuildStringify = async (errorCallback, successCallback) => {

  const registros = await Record.find()
    .select(['identificador', 'contexto', 'contenidoYEstructura', 'accesoYUso', 'notes',
      'documentacionAsociada', 'company', 'atomSlug'
    ]).lean().exec();

  successCallback(true);

  console.log('rebuildStringify to begin: [%s]', registros && registros.length);

  for (let k = 0; k < registros.length; k++) {
    let stringifiedString = buildStringifyField(registros[k]);
    try {
      await Record.updateOne({ _id: registros[k]._id }, {
        $set: {
          stringify: stringifiedString
        }
      });
    } catch (error) {
      errorCallback(error);
    }
  }
  console.log('rebuildStringify ENDED OK');

}

const buildStringifyField = (item) => {
  let stringifiedArray = [];
  let dataSet = new Set();

  if (item.identificador) {
    pushToStringifiedArray(dataSet, item.identificador)
  }
  if (item.contexto) {
    pushToStringifiedArray(dataSet, item.contexto);
  }
  if (item.contenidoYEstructura) {
    pushToStringifiedArray(dataSet, item.contenidoYEstructura);
  }
  if (item.accesoYUso) {
    pushToStringifiedArray(dataSet, item.accesoYUso);
  }
  if (item.notes && item.notes.length) {
    pushToStringifiedArray(dataSet, item.notes);
  }
  if (item.documentacionAsociada) {
    pushToStringifiedArray(dataSet, item.documentacionAsociada);
  }
  if (item.company) {
    pushToStringifiedArray(dataSet, item.company);
  }
  if (item.atomSlug) {
    pushToStringifiedArray(dataSet, item.atomSlug);
  }
  stringifiedArray = [...dataSet]
  return stringifiedArray.join(" ");
}

const pushToStringifiedArray = (dataSet, item) => {

  delete item._id;
  if (Array.isArray(item)) {
    item.forEach(i => {
      if (typeof i === 'object') {
        delete i._id;
        Object.keys(i).forEach(key => {
          if (i[key])
            dataSet.add(utils.safeStringify(i[key]))
        });
      } else {
        dataSet.add(utils.safeStringify(i));
      }
    })
  } else if (typeof item === 'string') {
    dataSet.add(utils.safeStringify(item))
  } else {
    Object.keys(item).forEach(key => {

      if (item[key] && Array.isArray(item[key])) {

        if (item[key].length) {

          item[key].forEach(i => {
            if (typeof i === 'object') {
              delete i._id;
              Object.keys(i).forEach(key => {
                if (i[key])
                  dataSet.add(utils.safeStringify(i[key]))
              });
            } else {
              dataSet.add(utils.safeStringify(i));
            }
          })
        }

      } else if (item[key]) {
        dataSet.add(utils.safeStringify(item[key]))
      }
    });
  }
}
const APAREO_KEYS = ['identificador', 'atomSlug', 'audit', 'assets', 'estado', 'actions'];
exports.fetchApareoTree = async (id, errCb, successCb) => {

  try {
    let apareoList = [];
    /** Compruebo que la UDA en cuestión tenga hijos
     *  cargados
     */
    const records = await _loadChildren(id, APAREO_KEYS);


    if (records && records.length) {
      apareoList = await loadChildToApareoList(records, apareoList, errCb, id);
    }
    successCb(apareoList);
  } catch (error) {
    errCb(error)
  }
}

const loadChildToApareoList = async (records, apareoList, errCb, idParent) => {
  /** Si los tiene itero sobre los mismos
   *  recuperandolos, y verificando si ellos también tienen hijos
   *  armando así el árbol de relaciones para abajo.
   */
  for (const children of records) {
    try {
      const apareoUda = new ApareoUda(children, idParent);
      /** mapping de children para aplanar los datos necesarios
       *  hacer class en node para pasarle el children y devuelve formateado el objeto aplanado.
       *  (class en FE y BE) para definir el tipo de datos que devuelve este método.
       */
      apareoList.push(apareoUda);

      /** Ahora verifico si este nodo tiene hijos también
       *  Si los tiene: voy a buscarlos antes de seguir con el siguiente hijo,
       *  si no los tiene: itero al siguiente hijo.
       */
      const childrenRecords = await _loadChildren(children._id, APAREO_KEYS);
      if (childrenRecords && childrenRecords.length) {
        apareoList = await loadChildToApareoList(childrenRecords, apareoList, errCb, children._id);
      }

    } catch (error) {
      errCb(error)
    }
  }
  return Promise.resolve(apareoList);
}
const UD_ASSETS_KEYS = ['assets', 'identificador'];

exports.buildChildrenTreeCollectingAssets = async (id, errCb, successCb) => {
  /** Vamos a comenzar buscando el nodo raíz */
  try {
    const rootUda = await Record.findById(id).select([...UD_ASSETS_KEYS, 'parent']);
    /** Inicializamos el array que va a ir guardando  las UDAS que tengan assets*/
    let udasWithAssets = [];
    if (rootUda && rootUda.assets && rootUda.assets.length) {
      const idParent = rootUda.parent && rootUda.parent.id_parent ? rootUda.parent.id_parent : null;
      let tienePdf = false;

      if (rootUda.identificador.level_of_description === 'unidad documental') {
        await assetModel.pdfExist(rootUda.assets[0].entityId, function (noTiene) {

        }, function (tiene) {
          tienePdf = tiene;
        });

      }

      udasWithAssets.push(new UdAssets(rootUda, idParent, tienePdf));
    }
    /** Compruebo que la UDA en cuestión tenga hijos
     *  cargados
     */
    const kids = await _loadChildren(rootUda._id, UD_ASSETS_KEYS);

    if (kids && kids.length > 0) {
      udasWithAssets = await verifyChildrenToCollectAssets(kids, udasWithAssets, errCb, id);
    }
    successCb(udasWithAssets);
  } catch (error) {
    errCb(error)
  }
}

const verifyChildrenToCollectAssets = async (childrens, udasWithAssets, errCb, idParent) => {

  /** Si los tiene itero sobre los mismos
   *  recuperandolos, y verificando si ellos también tienen hijos
   *  armando así el árbol de relaciones para abajo.
   */
  for (const kid of childrens) {
    try {
      if (kid) {
        if (kid.assets && kid.assets.length) {
          /** Contiene assets
           *  Entonces, lo pusheo al array
           */
          let tienePdf = false;
          // ACÁ
          if (kid.identificador.level_of_description === 'unidad documental') {
            await assetModel.pdfExist(kid.assets[0].entityId, function (noTiene) {

            }, function (tiene) {
              tienePdf = tiene;
            });

          }


          udasWithAssets.push(new UdAssets(kid, idParent, tienePdf));
        }
        /** Ahora verifico si este nodo tiene hijos también
         *  Si los tiene: voy a buscarlos antes de seguir con el siguiente hijo,
         *  si no los tiene: itero al siguiente hijo.
         */

        const grandkids = await _loadChildren(kid._id, UD_ASSETS_KEYS);

        if (grandkids && grandkids.length > 0) {
          udasWithAssets = await verifyChildrenToCollectAssets(grandkids, udasWithAssets, errCb, kid._id);
        }
      }
    } catch (error) {
      errCb(error)
    }
  }
  return Promise.resolve(udasWithAssets);

}


/**
 * PROCESO DE RECONSTRUCCIÓN DEL REFERENCE CODE
 * Aplica para todos los childs de aquel nodo que fue
 * movido de la jerarquía
 */

exports.rebuildReferenceCode = async function (baseUdaId, errCb, successCb) {
  /**
   * baseUDA el nodo a partir del cual todos sus descendientes
   * requieren reconfigurar su reference code
   */
  const baseUDA = await Record.findById(baseUdaId, 'identificador').lean().exec();
  if (baseUDA) {
    const identificador = baseUDA.identificador;
    const childs = await _loadChildren(baseUdaId, ['identificador', 'parent']);
    if (childs && childs.length) {
      processTreeOfChilds(identificador, childs);
      successCb(childs.length)
    } else {
      successCb(0);
    }
  }
}

const processTreeOfChilds = async function (baseIdentificador, childList) {
  for (const child of childList) {
    await updateOneChild(child, baseIdentificador)

    // habiendo actualizado al child, bajamos propagando a nietos
    const kids = await _loadChildren(child._id, ['identificador', 'parent']);
    if (kids && kids.length) {
      await processTreeOfChilds(child.identificador, kids);
    }

  }

}

async function updateOneChild(child, parentIdentificador) {
  let identifier = child.identificador.identifier;
  // actualiza el reference_code uniendo el parent.reference_ode con el identifier del child
  child.identificador.reference_code = [...parentIdentificador.reference_code, identifier];

  // actualizo los datos del parent
  child.parent.reference_code = [...parentIdentificador.reference_code];
  child.parent.identifier = parentIdentificador.identifier;
  child.parent.level_of_description = parentIdentificador.level_of_description;
  child.parent.title = parentIdentificador.title;
  return Record.findByIdAndUpdate(child._id, {
    identificador: child.identificador,
    parent: child.parent,
  });
}

exports.updateUdasFromApareo = async (apareoList, errorCb, successCb) => {

  const apareoUdList = [];
  try {
    for (const apareoUda of apareoList) {
      let apareoUdaRecord;
      if (apareoUda.estado !== 'inactivo')
        apareoUdaRecord = await Record.findByIdAndUpdate(apareoUda.idUda, { assets: apareoUda.assets, actions: apareoUda.actions }, { new: true });
      else
        apareoUdaRecord = await Record.findByIdAndUpdate(apareoUda.idUda, { estado: apareoUda.estado, actions: apareoUda.actions }, { new: true });

      apareoUdList.push(new ApareoUda(apareoUdaRecord));
    }
  } catch (error) {
    errorCb(error);
  }
  successCb(apareoUdList);
}

/*
 * Dada una UDA (en concreto su _id), retorna el registro anterior y el siguiente.
 *
 * @param udaId el ID de la UDA para la que se buscarán los registros 'hermanos'
 * @param errorCb Error callback
 * @param successCb Success callbac
 */
exports.findPrevNext = async (udaId, errorCb, successCb) => {
  try {
    const prevNext = {};
    const current = await Record.findById(udaId).select('parent').lean().exec();

    if (current && current.parent) {
      const siblings = await _loadChildren(current.parent.id_parent, ['identificador']);

      if (siblings.length > 0) {
        const position = siblings.findIndex(item => item._id.toString() === current._id.toString());

        if (siblings[position - 1])
          prevNext['prev'] = siblings[position - 1];

        if (siblings[position + 1])
          prevNext['next'] = siblings[position + 1];
      }
    }

    successCb(prevNext);
  } catch (error) {
    errorCb(error);
  }
}


function _loadChildren(udaId, properties) {
  let query = {
    'parent.id_parent': udaId,
    estado: 'activo'
  }

  return Record.find(query).select(properties).lean().exec();
}

exports.seekForDataCyC = async () => {
  const query = {
    'identificador.reference_code': 'CYC01',
    'identificador.level_of_description': 'item'
  }
  try {
    const list = await Record.find(query).lean().exec();
    if (list && list.length) {
      const udasUpdated = [];
      console.log('Retrieved: [%s]', list.length);

      for (let index = 0; index < list.length; index++) {
        udasUpdated.push(await processOneUdaCYC(list[index]));
      }
      return udasUpdated;
    } else {
      console.error('oopsss')
    }
  } catch (error) {
    console.error("ERROR SEEK FOR DATA CYC");
    throw new error;
  }


}

async function processOneUdaCYC(uda) {
  console.log('UDS: [%s]', uda.identificador.identifier)
  let inventario = uda.audit.inventario;
  if (inventario) {
    let analiticos = await AnaliticoModel.find({ inventario: inventario }).exec()
    if (analiticos && analiticos.length) {
      let analitico = analiticos[0]
      console.log('Found! [%s] -----> [%s]', inventario, analitico.codigo_referencia)
      await updateUdaFromAnalitico(uda, analitico);

    } else {
      console.error('Not found: [%s]', inventario);
    }

  }
  return uda;
}

async function updateUdaFromAnalitico(uda, analitico) {
  let puntoacceso = uda.puntoAcceso || {};

  let subjectAccess = puntoacceso.subject_access_points || [];
  let hasAlready = subjectAccess.find(t => t === analitico.tesauro)
  if (!hasAlready) {
    subjectAccess.push(analitico.tesauro);
    puntoacceso.subject_access_points = subjectAccess;
  }

  if (analitico.onomastico_1) {
    let onom1 = puntoacceso.name_access_points || [];
    let hasOnom1 = onom1.find(t => t === analitico.onomastico_1);
    if (!hasOnom1) {
      onom1.push(analitico.onomastico_1);
      puntoacceso.name_access_points = onom1;
    }
  }
  if (analitico.onomastico_2) {
    let onom2 = puntoacceso.name_access_points || [];
    let hasOnom2 = onom2.find(t => t === analitico.onomastico_2);
    if (!hasOnom2) {
      onom2.push(analitico.onomastico_2);
      puntoacceso.name_access_points = onom2;
    }
  }

  uda.puntoAcceso = puntoacceso;
  uda.documentacionAsociada.publication_notes = `Datos inventario analítico:
     código de referencia: ${analitico.codigo_referencia}
     contiene imagen anverso: ${analitico.anverso}
     contiene imagen reverso: ${analitico.reverso}
     referencia unidad de conservación original: ${analitico.uco_orig}
     `
  uda.contenidoYEstructura.scope_and_content = analitico.descripcion;
  await Record.findOneAndUpdate({ _id: uda._id }, uda).exec()
}
