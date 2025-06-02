#!/usr/bin/env node

/**
 * Module dependencies.
 * usage: DEVELOPMENT: 
 * DEBUG=develar:server PORT=8080 NODE_ENV=development DBASE=agndb SERVER=http://develar-local.co PUBLIC=/public node core/services/importLibrosScript
 * 
 * usage: PRODUCTION: SALUD
 * DEBUG=develar:server PORT=8081 NODE_ENV=production DBASE=agndb SERVER=https://salud.brown.gob.ar PUBLIC=/www/salud node core/services/importLibrosScript
 */

 const config = require('../config/config')
 const mongoose = require(config.dbconnect)(config); 
 const whoami =  "models/importLibrosScript.js: ";

 // necesarios para el proceso de importación
 
 const fs = require('fs');
 const path = require('path');
 const utils = require('./commons.utils');
 const csv = require('csvtojson')


 const analitico = require('../models/auxiliarymodels/analiticoLibrosModel');
 const udaModule = require('../models/unidadDescripcionModel');

 const AnaliticoModel = analitico.AnaliticoModel;
 const UdaModel = udaModule.GestionDocRecord;

 const debug = require('debug')(config.debug);

 const DEVEL = 'development';
 const PROD = 'production';

 debug('DEBUG STARTED ' );
 debug('PANIC SCRIPT  ' +  config.dbase);

 const analiticoFile = 'analiticoLibros.csv'

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
 * seekForData: una vez ingestado, las UDS de libros de migraciones DNM 1888 / 1917 buscan data acá
 * los datos para perfeccionar el registro
 * 
 **/
function seekForData(){
   let query = {
     'identificador.reference_code': 'DNM01',
     'identificador.level_of_description': 'unidad documental'
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
    await processOneUda(udas[index]);

  }
}

async function processOneUda(uda){
   console.log('UDS: [%s]', uda.identificador.identifier)
   let inventario = uda.audit.inventario;
   if(inventario){
    let analiticos = await AnaliticoModel.find({libroid: inventario}).exec()
    if(analiticos && analiticos.length){
      let analitico = analiticos[0]
      console.log('Found! [%s] -----> [%s]', inventario, analitico.titulo)
      await updateUdaFromAnalitico(uda, analitico);

    }else{
      console.error('Not found: [%s]', inventario);
    }

   }
   return uda;
}

async function updateUdaFromAnalitico(uda, analitico){
  let fed  = utils.parseDateStr(analitico.fedesde);
  let feh  = utils.parseDateStr(analitico.fehasta);
  let fed_ts = fed ? fed.getTime() : 0;
  let feh_ts = feh ? feh.getTime() : 0;
  let fechatexto = `${analitico.aniod}/${analitico.mesd} - ${analitico.anioh}/${analitico.mesh}`;
  uda.identificador.title = `${analitico.titulo} (#${analitico.libroid})`;

  let fechas = uda.identificador.dates;
  if (fechas && fechas.length){
    let fecha_existente = fechas.find(fe => fe.type === 'migraciones');

    // actualiza datos, se pretende que haya un solo registro de migraciones.
    if(fecha_existente){
      fecha_existente.start_date = analitico.fedesde;
      fecha_existente.end_date = analitico.fehasta;
      fecha_existente.date = fechatexto;
      fecha_existente.start_date_ts = fed_ts;
      fecha_existente.end_date_ts =   feh_ts;

    }else {
      let fechatoken = {
        type:          'migraciones',
        start_date:    analitico.fedesde,
        end_date:      analitico.fehasta,
        date:          fechatexto,
        start_date_ts: fed_ts,
        end_date_ts:   feh_ts,  
      }
      fechas.push(fechatoken);
    }

  }else {
      let fechatoken = {
        type:          'migraciones',
        start_date:    analitico.fedesde,
        end_date:      analitico.fehasta,
        date:          fechatexto,
        start_date_ts: fed_ts,
        end_date_ts:   feh_ts,  
      }
      uda.identificador.dates = [ fechatoken ];
  }
  await UdaModel.findOneAndUpdate({ _id: uda._id }, uda).exec()

}

 /**
	Importa archivo CSV con el detalle analitico del fondo DNM01 - AGN SEP 2021
  Popula la colección ad-hoc analiticolibros de mongo

  arch = path.join(config.rootPath,  'www/agn/storage/assets/import/analiticoLibros.csv');
  arch = path.join(config.rootPath,   'public/storage/assets/import/analiticoLibros.csv');
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
 
  csv({delimiter: ';'})
  .fromFile(arch)
  .then((records) => {


    if(!records) records = [];
    let models = records.filter(r => r && r.libroid);
    models = models.map(r => recordFactory(r, fecha));

    insertCollection(models);


  });
}

async function insertCollection(models){
  console.log('=======================================')
  console.log('>>>>>>>>>>>>> ready to insert: [%s]', models.length);
  AnaliticoModel.collection.insertMany(models, {})
}

function recordFactory(spec, fecha){
  let analitico = new AnaliticoLibros();
  analitico = {...analitico, ...spec}
  analitico.fe_importacion = fecha;
  console.dir(analitico);
  if(analitico.fedesde){
    analitico.fedesde_ts = utils.parseDateStr(analitico.fedesde).getTime();  
  }

  if(analitico.fehasta){
    analitico.fehasta_ts = utils.parseDateStr(analitico.fehasta).getTime();
  }

  return analitico;
}

class AnaliticoLibros {
  estado = 'activo';
  fe_importacion;

  libroid; 
  titulo; 
  fedesde; 
  fehasta; 
  aniod = 0; 
  mesd = 0; 
  diad = 0; 
  anioh = 0; 
  mesh = 0; 
  diah = 0; 
}


/**
 * FIN: importAnaliticoFromCSV
 ******************************/


