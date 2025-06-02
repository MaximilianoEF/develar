const whoami = "models/techMachineModel";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const techMachineSch = new Schema({
    cod_machine : {type : String, required: true, default: null},
    slug : {type : String, required: false, default: null},
    descripcion : {type : String, required: false, default: null},
    software : {type : String, required: false, default: null},
    version_software : {type : String, required: false, default: null},
    marca : {type : String, required: false, default: null},
    modelo : {type : String, required: false, default: null},
    fe_incorporacion_tx : {type : String, required: false, default: null},
    fe_incorporacion_ts : {type : Number, required: false, default: null},
    type_digitalizacion : {type : String, required: false, default: null},
    usos : {type : String, required: false, default: null},

})

function buildQuery(query){
    console.log("QUERY --> %o",query)
    let q = {};

    if(query.cod_machine){
        q['cod_machine']= query.cod_machine;
    }

    if(query.slug){
        q['slug'] = { '$regex': query.slug, '$options': 'ig' };
    }

    if(query.marca){
        q['marca'] = query.marca;
    }

    if(query.type_digitalizacion){
        q['type_digitalizacion'] = query.type_digitalizacion;
    }

    return q;
}




techMachineSch.pre('save', function (next) {
    return next();
});


/**
 * @param String: nombre del Modelo
 * @param Schema: Schema a partir del cual crear el modelo
 * @param String: nombre a asignar a las colecciones de modelos (en plural)
 */
const Record = mongoose.model('TechMachine', techMachineSch, 'techmachines');



/////////   CAPA DE SERVICIOS /////////////
/**
 * Retrieve all records
 * @param cb
 * @param errcb
 */
exports.findAll = function (errcb, cb) {
    Record.find().lean().exec(function(err, entities) {
        if (err) {
            errcb(err);
        }else{
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
    let regexQuery = buildQuery(query);


    Record.find(regexQuery).lean().exec(function(err, entities) {
        if (err) {
            console.log('[%s] findByQuery ERROR: [%s]',whoami, err)
            errcb(err);
        }else{
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

    Record.findById(id, function(err, entity) {
        if (err){
            console.log('[%s] findByID ERROR() argument [%s]', whoami, arguments.length);
            err.itsme = whoami;
            errcb(err);
        
        }else{
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
exports.update = function (id, record, errcb, cb) {

    Record.findByIdAndUpdate(id, record, { new: true } ,function(err, entity) {
        if (err){
            console.log('[%s] validation error as validate() argument', whoami)
            err.itsme = whoami;
            errcb(err);
        
        }else{
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

    Record.create(record, function(err, entity) {
        if (err){
            console.log('[%s] validation error as validate() argument ', whoami)
            err.itsme = whoami;
            errcb(err);
        
        }else{
            cb(entity);
        }
    });

};