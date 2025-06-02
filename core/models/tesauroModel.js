const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const whoami =  "models/tesauroModel.js : ";
const MAX_RESULTS = 15000;


const tesauroSch = new Schema ({
    userId : { type : String, required : false },
    consultaAcervoId : { type : String, required : true },
    tsFechaHora : { type : Number , required : false},
    txFecha : { type : String , required : false},
    txHora : { type : String , required : false},
    palabra : { type : String, required : true}
})


/***
 * Funciones utilitarias
 * @param {Object} query Objeto con los parámetros de búsqueda recibidos desde el frontend
 */

function buildQuery(query){
    let q = {};

    if(query.userId) {
        q['userId'] = query.userId;
    }

    if (query.fechaDesde && query.fechaHasta) {
        q['$and'] = [{ 'tsFechaHora': { '$gte': parseInt(query.fechaDesde, 10), '$lt': parseInt(query.fechaHasta, 10) } }];
    } else {
        if (query.fechaDesde) {
            q['tsFechaHora'] = { "$gte": parseInt(query.fechaDesde, 10) };
        }

        if (query.fechaHasta) {
            q['tsFechaHora'] = { "$lt": parseInt(query.fechaHasta, 10) };
        }
    }

    console.log("DESDE : "+query.fechaDesde+"   Hasta: "+query.fechaHasta)

    return q;
}

/**
 * 
 * Metodos externos
 */


tesauroSch.pre('save', function (next) {
   return next();
});

const Tesauro = mongoose.model('Tesauro', tesauroSch, 'tesauros');

/**
* Retrieve busquedas from query
* @param cb
* @param errcb
*/
exports.findByQuery = function(query, errcb, cb) {
   let queryOptions = buildQuery(query);

   Tesauro.find(queryOptions).limit(MAX_RESULTS).lean().exec(function(error, results) {
       if (error) {
           errcb(error);
       } else {
           cb(results);
       }
   });
}

/**
* Retrieve all busquedas
* @param cb
* @param errcb
*/
exports.findAll = function (errcb, cb) {
   Tesauro.find().lean().exec(function(err, entities) {
       if (err) {
           errcb(err);
       }else{
           cb(entities);
       }
   });
};

/**
* Sign up a new busqueda
* @param record
* @param cb
* @param errcb
*/
exports.create = function (record, errcb, cb) {

   Tesauro.create(record, function(err, entity) {
       if (err){
           console.log('[%s] validation error as validate() argument ', whoami)
           err.itsme = whoami;
           errcb(err);
       
       }else{
           cb(entity);
       }
   });

};


exports.saveRegistro = function (tesauroData)
{
    let tesauro = new Tesauro(tesauroData);
    // tesauro.userId = tesauroData.userId;
    // tesauro.tsFechaHora = tesauroData.tsFechaHora;
    // tesauro.txHora = tesauroData.txHora;
    // tesauro.txFecha = tesauroData.txFecha;
    // tesauro.palabra = tesauroData.palabra;

    tesauro.save();
};

