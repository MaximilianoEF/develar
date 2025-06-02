const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const utils = require('../services/commons.utils');

const auditSch = new Schema({
  lastModifiedBy: {type: String, required: false, default: null},
  lastModifiedAt: {type: String, required: false, default: null},
  lastModifiedAtTs: {type: Number, required: false, default: null},

  createdBy: {type: String, required: false, default: null},
  createdAt: {type: String, required: false, default: utils.dateToStr(new Date())},
  createdAtTs: {type: Number, required: false, default: utils.dateNumFromTx(utils.dateToStr(new Date()))},
});


const identityAreaSch = new Schema({
  // Campo propio que identifica al país al que pertenece el registro de autoridad
  countryPrefix: {type: String, required: false, default: null},
  // Campo propio que almacenará el prefijo que llevan las UDAs que pertenezcan a este registro de autoridad
  udaPrefix: {type: String, required: false, default: null},

  entityType: {type: String, required: false, default: null}, // ISAAR 5.1.1
  authorizedName: {type: String, required: false, default: null} // ISAAR 5.1.2
});

const descriptionAreaSch = new Schema({
  existenceDates: {type: String, required: false, default: null}, // ISAAR 5.2.1
  history: {type: String, required: false, default: null}
});


const relationSch = new Schema({
  category: {type: String, required: false, default: null}, // ISAAR 5.3.2

  // Estos son campos propios nuestros, en orden de denormalizar la relación
  // ID Mongo
  authorityRecordId: {type: String, required: false, default: null},
  // entityType
  authorityRecordType: {type: String, required: false, default: null},
  // authorizedName
  authorityRecordName: {type: String, required: false, default: null}
});

const relationResourceSch = new Schema({
  // Campos propios en orden de denormalizar la relación
  // ID Mongo de la unidad de descripción
  resourceId: {type: String, required: false, default: null},
  // Identificador de la unidad de descripción
  resourceIdentifier: {type: String, required: false, default: null},

  resourceTitle: {type: String, required: false, default: null}, // ISAAR 6.1
  nature: {type: String, required: false, default: null} // ISAAR 6.3
});

const relationshipAreaSch = new Schema({
  relatedAuthorityRecords: {type: [relationSch], required: false, default: []},
  relatedResources: {type: [relationResourceSch], required: false, default: []}
});

const controlAreaSch = new Schema({
  identifier: {type: String, required: false, default: null} // ISAAR 5.4.1
});

const authorityRecordSch = new Schema({
  identityArea: { type: identityAreaSch, required: false, default: {} }, // ISAAR 5.1
  descriptionArea: { type: descriptionAreaSch, required: false, default: {} }, // ISAAR 5.2
  relationshipArea: { type: relationshipAreaSch, required: false, default: {} }, // ISAAR 5.3
  controlArea: { type: controlAreaSch, required: false, default: {} }, // ISAAR 5.4

  // Es un campo propio con datos de auditoría
  audit: { type: auditSch, required: false, default: {} },

  // Campo propio que determina si el registro de autoridad es además
  // una institución archivística
  isArchivalInstitution: {type: Boolean, required: false, default: false},

  isAtom: { type: Boolean, required: false, default: false }
});


const Record = mongoose.model('AuthorityRecord', authorityRecordSch, 'authorityrecords');

exports.AuthorityRecord = Record;

function buildQuery(query) {
  let q = {};

  if (query.entityType) {
    q['identityArea.entityType'] = query.entityType;
  }

  if (query.identifier) {
    q['controlArea.identifier'] = {'$regex': query.identifier, '$options': 'ig'};
  }

  if (query.authorizedName) {
    q['identityArea.authorizedName'] = {'$regex': query.authorizedName, '$options': 'ig'};
  }

  if (query.isArchivalInstitution) {
    q['isArchivalInstitution'] = query.isArchivalInstitution;
  }

  return q;
}

/**
 * Devuelve todos los registros
 *
 */
exports.findAll = function () {
  return Record.find().lean().exec();
}

/**
 * Devuelve los registros coincidentes con una consulta
 *
 */
exports.findByQuery = function (query) {
  const builtQuery = buildQuery(query);
  return Record.find(builtQuery).lean().exec();
}

/**
 * Devuelve un registro buscándolo por su ID (ID de MongoDB)
 *
 */
exports.findById = function (id) {
  return Record.findById(id).lean().exec();
}

/**
 * Da de alta un registro
 *
 */
exports.create = function (data) {
  delete data._id;
  return Record.create(data);
}

/**
 * Actualiza un registro
 *
 */
exports.update = function (id, data) {
  return Record.findOneAndUpdate({_id: id}, data, {new: true});
}

/**
 * Construye un AR con los datos mínimos, a partir de un registro de AtoM
 *
 * @param atomCreator registro mínimo proveniente de AtoM (endpoint /api/informationobjects)
 */
exports.createMinimalAuthorityRecord = function(atomCreator, isArchivalInstitution = false) {
  const record = {
    identityArea: {},
    descriptionArea: {},
    relationshipArea: {},
    controlArea: {},
    audit: {},
    isArchivalInstitution
  };

  if(atomCreator){
    if(atomCreator.authotized_form_of_name){
      record.identityArea.authorizedName = atomCreator.authotized_form_of_name;
    }else{
      record.identityArea.authorizedName = atomCreator;
    }
  }else{
    record.identityArea.authorizedName = '';
  }
  // record.identityArea.authorizedName = atomCreator.authotized_form_of_name || atomCreator || '';
  record.descriptionArea.existenceDates = atomCreator && atomCreator.dates_of_existence ? atomCreator.dates_of_existence : '';
  record.descriptionArea.history = atomCreator && atomCreator.history ? atomCreator.history :  '';

  record.isAtom = true;

  record.identityArea.udaPrefix = 'AR AGN ISAD';
  record.identityArea.countryPrefix = 'AR';
  record.controlArea.identifier = 'AGN';

  return record;
}
