const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const utils = require('../services/commons.utils');
//const { findByQuery } = require('./acervoModel');
const whoami = "models/consultasAcervoModel: ";
const MAX_RESULTS = 15000;
const registry = [];
const tesauro = require('./tesauroModel');

const condicionesSch = new Schema({
    termino: { type: String, required: false },
    buscarEn: { type: String, required: false },
    tipoBusqueda: { type: String, required: false }
})

const querySch = new Schema({
    recurso: { type: String, required: false },
    condiciones: { type: [condicionesSch], required: false }
})

const userMinimalSch = new Schema({
    userId: { type: String, required: false },
    nombre: { type: String, required: false },
    edad: { type: Number, required: false }
})

const consultaAcervoSch = new Schema({
    tsFechaHora: { type: Number, required: true },
    txFecha: { type: String, required: false },
    txHora: { type: String, required: false },
    palabras: [{ type: String, required: false }],
    source: { type: String, required: false, default: 'vida' },
    hits: { type: Number, required: false },
    user: { type: userMinimalSch, required: false },
    query: { type: querySch, required: false }

})





/***
 * Funciones utilitarias
 * @param {Object} query Objeto con los parámetros de búsqueda recibidos desde el frontend
 */

function buildQuery(query) {
    let q = {};

    if (query.userId) {
        q['user.userId'] = query.userId;
    }

    return q;
}

/**
 * 
 * Metodos externos
 */


consultaAcervoSch.pre('save', function(next) {
    return next();
});

const ConsultaAcervo = mongoose.model('ConsultaAcervo', consultaAcervoSch, 'consultasacervo');

/**
 * Retrieve busquedas from query
 * @param cb
 * @param errcb
 */
exports.findByQuery = function(query, errcb, cb) {
    let queryOptions = buildQuery(query);

    ConsultaAcervo.find(queryOptions).limit(MAX_RESULTS).lean().sort('-tsFechaHora').exec(function(error, results) {
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
exports.findAll = function(errcb, cb) {
    ConsultaAcervo.find().lean().exec(function(err, entities) {
        if (err) {
            errcb(err);
        } else {
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
exports.create = function(record, errcb, cb) {

    ConsultaAcervo.create(record, function(err, entity) {
        if (err) {
            console.log('[%s] validation error as validate() argument ', whoami)
            err.itsme = whoami;
            errcb(err);

        } else {
            cb(entity);
        }
    });

};


exports.procesarConsulta = function(query, hits) {
    // PASO 1) Construir el registro a grabar en consultasAcervo
    //c onsole.log("QUERY --> %o",query)
    let consulta = buildConsultasAcervo(query, hits);
    //c onsole.log("LA QUERY QUE FORMAMOS FUE : %o",consulta)
    consulta.save().then(record => {
        saveTesauro(query, record);
    });
    // PASO 2) Verificar si ya existe la consulta en registry
    // PASO 3.1) No existe en Registry
    // PASO 3.1.A) Insertar nuevo registro
    // PASO 3.1.B) Actualizar Registry

    // PASO 3.2) Existe en registry
    // PASO 3.2.1) RETURN ....

    //PASO 4) Guardamos el tesauro por cada elemento del array de palabras

}

function saveTesauro(query, record) {

    query.palabras.split(',').forEach(palabra => {
        if(palabra){
            let tesauroObj = {
                userId: query.userId,
                consultaAcervoId: record.id,
                tsFechaHora: query.tsFechaHora,
                txFecha: query.txFecha,
                txHora: query.txHora,
                palabra: palabra
            }
            tesauro.saveRegistro(tesauroObj);
        }
    })
}

function registryUpdate(consulta) {
    // PASO 1) Construir el hash (let hash = buildHash(consulta))
    // PASO 2) Insertar hash
    // PASO 3) If registry.length > MAX_RECORD then registry.shift()
}

function buildConsultasAcervo(query, hits) {
    let consulta = new ConsultaAcervo();
    consulta.hits = hits;
    consulta.txFecha = query.txFecha;
    consulta.tsFechaHora = query.tsFechaHora;
    consulta.txHora = query.txHora;
    consulta.user = {
        userId: query.userId,
        edad: query.userEdad,
        nombre: query.userNombre
    }
    consulta.palabras = query.palabras;
    let condiciones = [];
    if (query.isArray === 'true') {
        for (let i = 0; i < query.termino.length; i++) {
            let obj = {};
            obj.termino = query.termino[i];
            obj.buscarEn = query.buscarEn[i];
            obj.tipoBusqueda = query.tipoBusqueda[i];
            condiciones.push(obj);
        }
        consulta.query = {
            recurso: query.recurso,
            condiciones: condiciones
        }
    } else {
        consulta.query = {
            recurso: query.recurso,
            condiciones: {
                termino: query.termino,
                buscarEn: query.buscarEn,
                tipoBusqueda: query.tipoBusqueda
            }
        }
    }

    return consulta;
}


function verifyRegistry(consulta) {

    let existe = registry.find(r => {
        return true;
    })
    return existe ? true : false;
}