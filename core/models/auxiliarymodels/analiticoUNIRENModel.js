const whoami = "models/auxiliarymodels/analiticoDNEModel: ";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const utils = require('../../services/commons.utils');

const languageService = require('../../services/languageutils');
const unidadDescripcion = require('../unidadDescripcionModel');
const GestionDocRecord = unidadDescripcion.GestionDocRecord;

const analiticounirenSch = new Schema({
  estado : { type: String, required: false, default: 'activo'},
  fe_importacion: { type: String, required: false, default: null},

  analiticoId: { type: String, required: false, default: null},
  legacyId: { type: Number, required: false, default: null},
  parentId: { type: Number, required: false, default: null},
  qubitParentSlug: { type: String, required: false, default: null},
  accessionNumber: { type: String, required: false, default: null},
  identifier: { type: String, required: false, default: null},
  title: { type: String, required: false, default: null},
  levelOfDescription: { type: String, required: false, default: null},
  extentAndMedium: { type: String, required: false, default: null},
  repository: { type: String, required: false, default: null},
  archivalHistory: { type: String, required: false, default: null},
  acquisition: { type: String, required: false, default: null},
  scopeAndContent: { type: String, required: false, default: null},
  appraisal: { type: String, required: false, default: null},
  accruals: { type: String, required: false, default: null},
  arrangement: { type: String, required: false, default: null},
  accessConditions: { type: String, required: false, default: null},
  reproductionConditions: { type: String, required: false, default: null},
  language: { type: String, required: false, default: null},
  script: { type: String, required: false, default: null},
  languageNote: { type: String, required: false, default: null},
  physicalCharacteristics: { type: String, required: false, default: null},
  findingAids: { type: String, required: false, default: null},
  locationOfOriginals: { type: String, required: false, default: null},
  locationOfCopies: { type: String, required: false, default: null},
  relatedUnitsOfDescription: { type: String, required: false, default: null},
  publicationNote: { type: String, required: false, default: null},
  digitalObjectPath: { type: String, required: false, default: null},
  digitalObjetURI: { type: String, required: false, default: null},
  generalNote: { type: String, required: false, default: null},
  subjectAccessPoints: { type: String, required: false, default: null},
  placeAccessPoints: { type: String, required: false, default: null},
  nameAccessPoints: { type: String, required: false, default: null},
  genreAccessPoints: { type: String, required: false, default: null},
  DescriptionIDentifier: { type: String, required: false, default: null}, //Está escrito de esta forma en el excel
  institutionIdentifier: { type: String, required: false, default: null},
  rules: { type: String, required: false, default: null},
  descriptionStatus: { type: String, required: false, default: null},
  levelOfDetail: { type: String, required: false, default: null},
  revisionHistory: { type: String, required: false, default: null},
  languageOfDescription: { type: String, required: false, default: null},
  scriptOfDescription: { type: String, required: false, default: null},
  sources: { type: String, required: false, default: null},
  archivistNote: { type: String, required: false, default: null},
  publicationStatus: { type: String, required: false, default: null},
  physicalObjectName: { type: String, required: false, default: null},
  physicalObjectLocation: { type: String, required: false, default: null},
  physicalObjectType: { type: String, required: false, default: null},
  alternativeIdentifiers: { type: String, required: false, default: null},
  alternativeIdentifierLabels: { type: String, required: false, default: null},
  eventDates: { type: String, required: false, default: null},
  eventTypes: { type: String, required: false, default: null},
  eventStartDates: { type: String, required: false, default: null},
  eventEndDates: { type: String, required: false, default: null},
  eventActors: { type: String, required: false, default: null},
  eventActorHistories: { type: String, required: false, default: null},
  culture: { type: String, required: false, default: null},
})

const Record = mongoose.model('Analiticouniren', analiticounirenSch, 'analiticosuniren');

exports.AnaliticoModel = Record;

/************************************************
 * QUERY
 *
 */

 function buildQuery(query) {
  let q = {};

  if(query.identifier) {
    q['identifier'] = query.identifier;
  }

  return q;
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
 * Retrieve records from query /search/?name=something
 * @param cb
 * @param errcb
 */
exports.findByQuery = function (query, errcb, cb) {
  console.dir(query);

  let regexQuery = buildQuery(query)

  console.dir(regexQuery);

  Record.find(regexQuery).lean().limit(LIMIT).exec(function (err, entities) {
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

/////////////////////////////////////////////////////

exports.seekForDataDNE = async () => {
  const query = {
    'identificador.reference_code': 'DNE01',
    'identificador.level_of_description': 'unidad documental'
  }
  try {
    const list = await GestionDocRecord.find(query).lean().exec();
    if (list && list.length) {
      const udasUpdated = [];

      for (let index = 0; index < list.length; index++) {
        const uda = await processOneUdaDNE(list[index])
        if(uda)
          udasUpdated.push(uda);
      }
      console.log("udas updated --> %s",udasUpdated.length)
      return udasUpdated;
    } else {
      console.error('oopsss')
    }
  } catch (error) {
    console.error("ERROR SEEK FOR DATA DNE --> %o",error);
    throw new error;
  }


}

async function processOneUdaDNE(uda) {
  console.log('UDA: [%s]', uda.identificador.identifier)
  let identifier = uda.audit.inventario;
  console.log("inventario --> %o",identifier)
  if (identifier) {
    let analiticos = await Record.find({ identifier }).exec()
    if (analiticos && analiticos.length) {
      let analitico = analiticos[0]
      console.log('Found! [%s] -----> [%s]', identifier, analitico.identifier)
      await updateUdaFromAnalitico(uda, analitico);

    } else {
      console.error('Not found: [%s]', identifier);
      return;
    }
    return uda;
  } else {
    console.log("no tiene num inventario");
    return null;
  }
}

async function updateUdaFromAnalitico(uda, analitico) {

  uda.identificador = uda.identificador ? uda.identificador : {};
  uda.identificador.title = analitico.title;
  uda.identificador.extend_and_medium = analitico.extendAndMedium;
  if(analitico.alternativeIdentifiers) {
    uda.identificador.alternative_identifiers = uda.identificador.alternative_identifiers ? uda.identificador.alternative_identifiers : [];
    uda.identificador.alternative_identifiers.push(analitico.alternativeIdentifiers);
  }
  if(analitico.alternativeIdentifierLabels) {
    uda.identificador.alternative_identifier_labels = uda.identificador.alternative_identifier_labels ? uda.identificador.alternative_identifier_labels : [];
    uda.identificador.alternative_identifier_labels.push(analitico.alternativeIdentifierLabels);
  }
  uda.identificador.dates = uda.identificador.dates ? uda.identificador.dates : [];
  const date = {
    date: analitico.eventDates,
    type: analitico.eventTypes || 'accumulation', //normalizar
    start_date: analitico.eventStartDates,
    start_date_ts: utils.dateNumFromTx(analitico.eventStartDates),
    end_date: analitico.eventEndDates,
    end_date_ts: utils.dateNumFromTx(analitico.eventEndDates),
  }
  uda.identificador.dates.push(date);

  uda.contexto = uda.contexto ? uda.contexto : {};
  uda.contexto.repository = analitico.repository;
  uda.contexto.archival_history = analitico.archivalHistory;
  uda.contexto.immediate_source_of_acquisition_or_transfer = analitico.acquisiton;

  uda.contenidoYEstructura = uda.contenidoYEstructura ? uda.contenidoYEstructura : {};
  uda.contenidoYEstructura.scope_and_content = analitico.scopeAndContent;
  uda.contenidoYEstructura.appraisal_destruction_and_scheduling = analitico.appraisal;
  uda.contenidoYEstructura.accruals = analitico.accruals;
  uda.contenidoYEstructura.especificaciones = uda.contenidoYEstructura.especificaciones ? uda.contenidoYEstructura.especificaciones : [];
  uda.contenidoYEstructura.especificaciones.push( {sistem_of_arrangement: analitico.arrangement, type: 'no_definido'} );

  uda.accesoYUso = uda.accesoYUso ? uda.accesoYUso : {};
  uda.accesoYUso.conditions_governing_access = analitico.accessConditions;
  uda.accesoYUso.conditions_governing_reproduction = analitico.reproductionConditions;
  uda.accesoYUso.languages_of_material = uda.accesoYUso.languages_of_material ? uda.accesoYUso.languages_of_material : [];
  const language = analitico.language ? analitico.language.toLowerCase() : '';
  if(language) {
    uda.accesoYUso.languages_of_material.push(language);
  }
  const script = languageService.convertLanguageNameToISO15924(analitico.script);
  if(script) {
    uda.accesoYUso.scripts_of_material = uda.accesoYUso.scripts_of_material ? uda.accesoYUso.scripts_of_material : [];
    uda.accesoYUso.scripts_of_material.push(script);
  }
  uda.accesoYUso.notas = analitico.languageNote;
  uda.accesoYUso.physical_characteristics_and_technical_requirements = analitico.physicalCharacteristics;
  uda.accesoYUso.finding_aids = analitico.findingAids;

  uda.documentacionAsociada = uda.documentacionAsociada ? uda.documentacionAsociada : {};
  uda.documentacionAsociada.existence_and_location_of_originals = analitico.locationOfOriginals;
  uda.documentacionAsociada.existence_and_location_of_copies = analitico.locationOfCopies;
  uda.documentacionAsociada.related_descriptions = analitico.relatedUnitsOfDescription;
  uda.documentacionAsociada.publication_notes = uda.documentacionAsociada.publication_notes ? uda.documentacionAsociada.publication_notes : [];
  if(analitico.publicationNote && analitico.publicationNote !== 'Se desconoce') {
    uda.documentacionAsociada.publication_notes.push(analitico.publicationNote);
  }
  uda.documentacionAsociada.publication_notes = `Datos inventario analítico:
  identifier: ${analitico.identifier}
  código de referencia: ${uda.identificador.reference_code}
     `
  uda.notes = uda.notes ? uda.notes : [];
  if(analitico.generalNote) {
    uda.notes.push(analitico.generalNote);
  }

  uda.puntoAcceso = uda.puntoAcceso ? uda.puntoAcceso : {};
  if(analitico.subjectAccessPoints) {
    uda.puntoAcceso.subject_access_points = uda.puntoAcceso.subject_access_points ? uda.puntoAcceso.subject_access_points : [];
    uda.puntoAcceso.subject_access_points = analitico.subjectAccessPoints;
  }
  if(analitico.placeAccessPoints) {
    uda.puntoAcceso.place_access_points = uda.puntoAcceso.place_access_points ? uda.puntoAcceso.place_access_points : [];
    uda.puntoAcceso.place_access_points = analitico.subjectAccessPoints;
  }
  if(analitico.nameAccessPoints) {
    uda.puntoAcceso.name_access_points = uda.puntoAcceso.name_access_points ? uda.puntoAcceso.name_access_points : [];
    uda.puntoAcceso.name_access_points = analitico.nameAccessPoints;
  }

  if(analitico.genreAccessPoints) {
    uda.puntoAcceso.genre_access_points = uda.puntoAcceso.genre_access_points ? uda.puntoAcceso.genre_access_points : [];
    uda.puntoAcceso.genre_access_points = analitico.genreAccessPoints;
  }

  uda.controlDeLaDescripcion = uda.controlDeLaDescripcion ? uda.controlDeLaDescripcion : {};
  uda.controlDeLaDescripcion.description_identifier = analitico.DescriptionIDentifier; //Está así en el excel
  uda.controlDeLaDescripcion.institution_identifier = analitico.institutionIdentifier;
  uda.controlDeLaDescripcion.rules_and_or_conventions_used = analitico.rules;
  uda.controlDeLaDescripcion.status = analitico.descriptionStatus;
  uda.controlDeLaDescripcion.level_of_detail = analitico.levelOfDetail;
  uda.controlDeLaDescripcion['Dates of creation revision deletion'] = analitico.revisionHistory;
  const languageOfDescription = analitico.languageOfDescription ? analitico.languageOfDescription.toLowerCase() : '';
  if(languageOfDescription) {
    uda.controlDeLaDescripcion.languages_of_description = uda.controlDeLaDescripcion.languages_of_description ? uda.controlDeLaDescripcion.languages_of_description : [];
    uda.controlDeLaDescripcion.languages_of_description.push(languageOfDescription);
  }
  const scriptOfDescription = languageService.convertISO15924ToLanguageName(analitico.scriptOfDescription);
  if(scriptOfDescription) {
    uda.controlDeLaDescripcion.script_of_description = uda.controlDeLaDescripcion.script_of_description ? uda.controlDeLaDescripcion.script_of_description : [];
    uda.controlDeLaDescripcion.script_of_description.push(scriptOfDescription);
  }

  if(analitico.archivistNote) {
    uda.controlDeLaDescripcion.archivists_notes = uda.controlDeLaDescripcion.archivists_notes ? uda.controlDeLaDescripcion.archivists_notes : [];
    uda.controlDeLaDescripcion.archivists_notes.push(analitico.archivistNote);
  }
  uda.controlDeLaDescripcion.publication_status = analitico.publicationStatus;


  /**
   * Faltarían:
  physicalObjectName - culture
  sources - physicalObjectLocation-
  physicalObjectType - eventActorHistories
  */
  await GestionDocRecord.findByIdAndUpdate(uda._id, uda).exec();
}
