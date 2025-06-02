#!/usr/bin/env node

/**
 * IMPORTACIÓN Y USO DE COLECCIONES AUXILIARES DNE
 * usage: DEVELOPMENT:
 * DEBUG=develar:server PORT=8080 NODE_ENV=development DBASE=agndb SERVER=http://develar-local.co PUBLIC=/public node core/services/importAnaliticoDNEScript
 *  DEBUG=develar:server PORT=8080 NODE_ENV=development DBASE=develar SERVER=http://develar-local.co PUBLIC=/public node core/services/importAnaliticoDNEScript
 */

 const config = require('../config/config')
 const mongoose = require(config.dbconnect)(config);

 const path = require('path');
 const utils = require('./commons.utils');
 const csv = require('csvtojson');

const analitico = require('../models/auxiliarymodels/analiticoDNEModel');
const AnaliticoModel = analitico.AnaliticoModel;

const debug = require('debug')(config.debug);


debug('DEBUG STARTED ' );
debug('PANIC SCRIPT  ' +  config.dbase);

const analiticoFile = 'AR-AGN-ISAD-DNE01_02.csv'
const importFile = {
  development: path.join(config.rootPath,'public/storage/assets/import',analiticoFile),
  production:  path.join(config.rootPath,'www/agn/storage/assets/import',analiticoFile)
}

const runmode = process.env.NODE_ENV; // development | production


setTimeout(() => {
  importAnaliticoFromCSV();
}, 1000);


function importAnaliticoFromCSV(){
  console.log('importAnaliticoFromCSV BEGIN  ************* modo: [%s] **********', runmode);
  const arch = importFile[runmode];

  _processInputArchive(arch)
}

function _processInputArchive(arch) {
  console.log("ProcessInputArchive to BEGIN [%s]",arch);
  const fe_importacion = utils.dateToStr(new Date());

  csv({ delimiter : ';'})
  .fromFile(arch)
  .then((records) => {
    console.log("Se importan [%s] registros",records.length)
    if(!records) records = [];

    const models = records.map(r => recordFactory(r, fe_importacion));

    insertCollection(models);
  });
}

function recordFactory(spec, fecha){
  let analitico = new AnaliticoDNE();
  analitico = {...analitico, ...spec}
  analitico.fe_importacion = fecha;
  analitico.analiticoId = analitico.identifier;
  console.dir(analitico);

  return analitico;
}

async function insertCollection(models){
  console.log('=======================================')
  console.log('>>>>>>>>>>>>> Ready to insert: [%s]', models.length);
  try {
    await AnaliticoModel.collection.insertMany(models, {});
    console.log("======================================");
    console.log("Analíticos dados de alta correctamente, puede detener el script");
  } catch(error) {
    console.error("Error al insertar los registros en la BD");
  }
}

class AnaliticoDNE {
  estado = 'activo';
  fe_importacion;

  analiticoId;
  legacyId;
  parentId;
  qubitParentSlug;
  accessionNumber;
  identifier;
  title;
  levelOfDescription;
  extentAndMedium;
  repository;
  archivalHistory;
  acquisition;
  scopeAndContent;
  appraisal;
  accruals;
  arrangement;
  accessConditions;
  reproductionConditions;
  language;
  script;
  languageNote;
  physicalCharacteristics;
  findingAids;
  locationOfOriginals;
  locationOfCopies;
  relatedUnitsOfDescription;
  publicationNote;
  digitalObjectPath;
  digitalObjetURI;
  generalNote;
  subjectAccessPoints;
  placeAccessPoints;
  nameAccessPoints;
  genreAccessPoints;
  DescriptionIDentifier; //Está escrito de esta forma en el excel
  institutionIdentifier;
  rules;
  descriptionStatus;
  levelOfDetail;
  revisionHistory;
  languageOfDescription;
  scriptOfDescription;
  sources;
  archivistNote;
  publicationStatus;
  physicalObjectName;
  physicalObjectLocation;
  physicalObjectType;
  alternativeIdentifiers;
  alternativeIdentifierLabels;
  eventDates;
  eventTypes;
  eventStartDates;
  eventEndDates;
  eventActors;
  eventActorHistories;
  culture;
}
