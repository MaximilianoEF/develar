#!/usr/bin/env node

/**
 * Module dependencies.
 * usage: DEVELOPMENT: 
 * DEBUG=develar:server PORT=8080 NODE_ENV=development DBASE=agndb SERVER=http://develar-local.co PUBLIC=/public node core/services/importAnaliticoCyCScript
 * 
 * usage: PRODUCTION: SALUD
 * DEBUG=develar:server PORT=8081 NODE_ENV=production DBASE=agndb SERVER=https://salud.brown.gob.ar PUBLIC=/www/salud node core/services/importAnaliticoCyCScript
 */

 const config = require('../config/config')
 const mongoose = require(config.dbconnect)(config); 
 const whoami =  "models/importAnaliticoCyCScript.js: ";

 
 // necesarios para el proceso de importación
 
 const fs = require('fs');
 const path = require('path');
 const utils = require('./commons.utils');
 const csv = require('csvtojson')


 const analitico = require('../models/auxiliarymodels/analiticoCyCModel');
 const udaModule = require('../models/unidadDescripcionModel');

 const AnaliticoModel = analitico.AnaliticoModel;
 const UdaModel = udaModule.GestionDocRecord;

 const debug = require('debug')(config.debug);

 const DEVEL = 'development';
 const PROD = 'production';



 debug('DEBUG STARTED ' );
 debug('PANIC SCRIPT  ' +  config.dbase);

 const analiticoFile = 'analiticocycImportCsv.csv'

 const importFile = {
   development: path.join(config.rootPath,'public/storage/assets/import',analiticoFile),
   production:  path.join(config.rootPath,'www/agn/storage/assets/import',analiticoFile)
 }

 const runmode = process.env.NODE_ENV; // development | production

 setTimeout(()=> {
     seekForData();
     //importAnaliticoFromCSV();

 }, 1000);

  /*************************************************************************************
 * seekForData: una vez ingestado, las UDS de Caras y Caretas buscan en la colección analiticoscyc
 * los datos para perfeccionar el registro
 *   
 * place_access_points: string[];
  name_access_points: string[];
  subject_access_points: string[];
  genre_access_points: string[];

 **/
function seekForData(){
   let query = {
     'identificador.reference_code': 'CYC01',
     'identificador.level_of_description': 'item'
   }

   UdaModel.find(query).lean().exec().then(list => {
     if(list && list.length){
       console.log('Retrieved: [%s]', list.length)
       _seekForAnalyticData(list);
     }else{
       console.error('oopsss')
     }
   })

}



async function _seekForAnalyticData(udas){

  for(let index = 0; index < udas.length; index++){
    await processOneUdaCYC(udas[index]);

  }

}

async function processOneUdaCYC(uda){
   console.log('UDS: [%s]', uda.identificador.identifier)
   let inventario = uda.audit.inventario;
   if(inventario){
    let analiticos = await AnaliticoModel.find({inventario: inventario}).exec()
    if(analiticos && analiticos.length){
      let analitico = analiticos[0]
      console.log('Found! [%s] -----> [%s]', inventario, analitico.codigo_referencia)
      await updateUdaFromAnalitico(uda, analitico);

    }else{
      console.error('Not found: [%s]', inventario);
    }

   }
   return uda;
}

async function updateUdaFromAnalitico(uda, analitico){
  let puntoacceso = uda.puntoAcceso || {};

  let subjectAccess = puntoacceso.subject_access_points || [];
  let hasAlready = subjectAccess.find(t => t === analitico.tesauro)
  if(!hasAlready){
    subjectAccess.push(analitico.tesauro);
    puntoacceso.subject_access_points = subjectAccess;
  }

  if(analitico.onomastico_1){
    let onom1 = puntoacceso.name_access_points || [];
    let hasOnom1 = onom1.find(t => t === analitico.onomastico_1);
    if(!hasOnom1){
      onom1.push(analitico.onomastico_1);
      puntoacceso.name_access_points = onom1;
    }
  }
  if(analitico.onomastico_2){
    let onom2 = puntoacceso.name_access_points || [];
    let hasOnom2 = onom2.find(t => t === analitico.onomastico_2);
    if(!hasOnom2){
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
  await UdaModel.findOneAndUpdate({ _id: uda._id }, uda).exec()
}


 /*************************************************************************************
 * importAnaliticoFromCSV: usado en sep-2021 para el fondo Caras & Caretas
 * usage: DEVELOPMENT: 
 * DEBUG=develar:server PORT=8080 NODE_ENV=development DBASE=agndb_dev SERVER=http://develar-local.co PUBLIC=/public node core/services/importAnaliticoCyCScript
 * 
 * usage: PRODUCTION: SALUD
 * DEBUG=develar:server PORT=8080 NODE_ENV=production DBASE=agndb_dev SERVER=https://agn200.mininterior.gob.ar PUBLIC=/www/agn node core/services/importAnaliticoCyCScript
 */


 /**
	Importa archivo CSV con el detalle analitico del fondo CyC - AGN SEP 2021
  Popula la colección ad-hoc analiticocyc de mongo

  arch = path.join(config.rootPath,  'www/agn/storage/assets/import/analiticocycImportCsv.csv');
  arch = path.join(config.rootPath,   'public/storage/assets/import/analiticocycImportCsv.csv');

  API: NONE
	  // EJEMPLO local:  http://localhost:8080/api/auditodatos/importsisa
	  // EJEMPLO server: http://salud.brown.gob.ar/api/auditodatos/importsisa

**/

function importAnaliticoFromCSV(){
  let feref = new Date();
  console.log('importAnaliticoFromCSV BEGIN  ************* modo: [%s] **********', runmode);
  const arch = importFile[runmode];

  _processInputArchive(arch)

}



function _processInputArchive(arch){
  console.log('processInputArchive to BEGIN [%s]', arch)
  let fecha = utils.dateToStr(new Date());
 

  function toLowerCase(name){
      return name.toLowerCase();
  }

  function toUpperCase(name){
      return name.toUpperCase();
  }

  csv({delimiter: ';'})
  .fromFile(arch)
  .then((records) => {


    if(!records) records = [];
    let models = records.map(r => recordFactory(r, fecha));

    insertCollection(models);


  });
}

async function insertCollection(models){
  console.log('=======================================')
  console.log('>>>>>>>>>>>>> ready to insert: [%s]', models.length);
  AnaliticoModel.collection.insertMany(models, {})

}

function recordFactory(spec, fecha){
  let analitico = new AnaliticoCyC();
  analitico = {...analitico, ...spec}
  analitico.fe_importacion = fecha;

  if(spec.fe_publicacion){
    let date = utils.parseAtomDateStr(spec.fe_publicacion)
    if(date){
      analitico.fe_publicacion_tx = utils.dateToStr(date);
      analitico.fe_publiacion_ts = date.getTime();
      analitico.anio_publicacion = date.getFullYear();
    }
  }

  if(spec.carpeta){
    let aux = parseInt(spec.carpeta,10);
    if(!isNaN(aux)){
      analitico.serie = ('000' + aux).substr(-3)
    }
  }

  return analitico;
}

class AnaliticoCyC {
  codigo_referencia;
  anverso;
  reverso;
  fondo;
  uco_orig;
  carpeta;
  inventario;
  tesauro;
  tesauro_neto;
  descripcion;
  onomastico_1;
  onomastico_2;
  fe_publicacion;
  nro_publicacion;
  observaciones;

  fe_publiacion_tx = '';
  fe_publiacion_ts = 0;
  anio_publicacion = 0
  serie = '000';
  estado = 'activo';
  fe_importacion;
  
}


/**
 * FIN: importAnaliticoFromCSV
 ******************************/


