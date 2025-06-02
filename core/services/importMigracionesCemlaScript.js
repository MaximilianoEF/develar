#!/usr/bin/env node

/**
 * IMPORTACIÓN Y USO DE COLECCIONES AUXILIARES DN MIGRACIONES SEP-2021
 * usage: DEVELOPMENT: 
 * DEBUG=develar:server PORT=8080 NODE_ENV=development DBASE=agndb SERVER=http://develar-local.co PUBLIC=/public node core/services/importMigracionesCemlaScript
 * 
 * usage: PRODUCTION: SALUD
 * DEBUG=develar:server PORT=8081 NODE_ENV=production DBASE=agndb SERVER=https://salud.brown.gob.ar PUBLIC=/www/salud node core/services/importMigracionesCemlaScript
 */


 const config = require('../config/config')
 const mongoose = require(config.dbconnect)(config); 
 const whoami =  "services/importMigracionesCemlaScript.js: ";

 
 // necesarios para el proceso de importación
 
 const fs = require('fs');
 const path = require('path');
 const utils = require('./commons.utils');
 const csv = require('csvtojson')
 const readline = require('readline');

 const analitico = require('../models/auxiliarymodels/analiticoMigrantesModel');
 const udaModule = require('../models/unidadDescripcionModel');

 const AnaliticoModel = analitico.AnaliticoModel;
 const UdaModel = udaModule.GestionDocRecord;

 const debug = require('debug')(config.debug);

 const DEVEL = 'development';
 const PROD = 'production';



 debug('DEBUG STARTED ' );
 debug('PANIC SCRIPT  ' +  config.dbase);

 const analiticoFile = 'analiticoMigrantes.sql'

 const importFile = {
   development: path.join(config.rootPath,'public/storage/assets/import',analiticoFile),
   production:  path.join(config.rootPath,'www/agn/storage/assets/import',analiticoFile)
 }

 const runmode = process.env.NODE_ENV; // development | production

 setTimeout(()=> {
     //seekForData();
     importAnaliticoFromFile();

 }, 1000);



 /**
	Importa archivo con el detalle analitico de la base CEMLA con entrada/salida migrantes - AGN SEP 2021
  El archivo de input es un archivo SQL, se parsea línea por línea el contenido para popular la colección.
  Popula la colección migrantes de mongo

  arch = path.join(config.rootPath,  'www/agn/storage/assets/import/{$analiticoFile}');
  arch = path.join(config.rootPath,   'public/storage/assets/import/{$analiticoFile}}');
  SEARCH BY 
    {barcodigo: 'ANDALUCIA STAR'}
 **/

function importAnaliticoFromFile(){
  console.log('importAnaliticoFromFile BEGIN  ************* modo: [%s] **********', runmode);
  const arch = importFile[runmode];

  _processInputArchive(arch)
}

// worker:
function _processInputArchive(arch){
  console.log('processInputArchive to BEGIN [%s]', arch)
  let fe_importacion = utils.dateToStr(new Date());
  let index = 0;
  let re = /"/g; // para quitar las comillas del array de variables

  let arrayRecord = [];
 
  const readInterface = readline.createInterface({
    input: fs.createReadStream(arch),
    crlfDelay: Infinity,
    console: false
  });
  
  readInterface.on('line', function(line) {

    // if(index > 5000000 ) {
    //   readInterface.close();
    //   return;
    // }

    if(index % 50000 === 0){
      insertCollection(arrayRecord);
      arrayRecord = [];
      index = 0;
    }
    index += 1;

    if(line){
      let offset1 = line.indexOf('VALUES (') + 8
      let offset2 = (line.indexOf(')', offset1) - 0);
      let payload = line.substring(offset1, offset2).replace(re, '');

      let arrayData = payload.split (',')
      let anioevento, mesevento = 0;
           //CHERBURGO,  SIN INFORMACION, ACEVEDO,  JULIA,  70,        NULL,      F,   RENTISTA,1910-10-13 00:00:00,SIN DATO,        NULL,    NULL,     NULL,     ARGENTINA
      const [ embarque,  barconombre,  apellido, nombre, edadanios, edadmeses, sexo, profesion, fecha,              lugarnacimiento, aniomes, nrolista, nrorden,  nacionalidad ] = arrayData;
      const barcocodigo = barconombre;
      const tipoevento = 'arribo';
      const fechaevento = utils.parseAtomDateStr(fecha);
      let fechaevento_ts = 0;

      if(fechaevento){
        anioevento = fechaevento.getFullYear();
        mesevento = fechaevento.getMonth() + 1;
        fechaevento_ts = fechaevento.getTime();        
      }

      const spec = { embarque, barconombre, apellido, nombre, edadanios, edadmeses, sexo, profesion, fechaevento, anioevento, mesevento, barcocodigo , tipoevento, nrorden, nrolista, fe_importacion, lugarnacimiento, aniomes, nacionalidad, fechaevento_ts};
      const record = {...new Analitico(), ...spec};
      //
      arrayRecord.push(record);

      //
      if(index%1000) console.log('index:[%s] -[%s]', index, payload);
      //c onsole.dir(record);

    }
  });
  console.log('==============================================')
  console.log('******+ end ************')
  insertCollection(arrayRecord);
  arrayRecord = [];
  //readInterface.close();
  console.log('==============================================')
}


async function insertCollection(models){
  console.log('>>>>>>>>>>>>> ready to insert: [%s]', models && models.length);
  if(models && models.length){
    console.log(AnaliticoModel)
    AnaliticoModel.collection.insertMany(models, {})

  }
}

class Analitico {
  embarque;
  barconombre;
  barcocodigo;
  apellido;
  nombre;
  edadanios;
  edadmeses;
  sexo;
  nacionalidad;
  profesion;
  fechaevento;
  aniomes;
  anioevento;
  fechaevento_ts;
  tipoevento;
  nrorden;
  nrolista;
  estado = "activo";
  lugarnacimiento;
  fe_importacion;
}

/**
 * FIN: importAnaliticoFromFile
 ******************************/


  /*************************************************************************************
 * seekForData: 
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
    let inventario = uda.controlDeLaDescripcion.description_identifier;
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
     uda.puntoAcceso = puntoacceso;
   }
   uda.documentacionAsociada.publication_notes = `Datos inventario analítico: 
       código de referencia: ${analitico.codigo_referencia} 
       contiene imagen anverso: ${analitico.anverso}
       contiene imagen reverso: ${analitico.reverso}
       referencia unidad de conservación original: ${analitico.uco_orig}
       `
   uda.contenidoYEstructura.scope_and_content = analitico.descripcion;
   await UdaModel.findOneAndUpdate({ _id: uda._id }, uda).exec()
 }
 /**
 * FIN: seekForData
 ******************************/


 