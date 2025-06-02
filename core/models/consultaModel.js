/**
 * Consultas CONSULTAS
 */

const whoami = "models/consultaModel: ";
const mongoose = require('mongoose');
const config = require('../config/config')
const path = require('path');
const utils = require('../services/commons.utils');
const usuarios = require('./agnUsuarioWebModel');
const personas = require('./personModel');
const mailer = require('../services/sendmail');
const Schema = mongoose.Schema;

const self = this;


const atendidoxSch = new Schema({
    userAdmId: { type: String, required: false },
    userWebId: { type: String, required: false },
    slug: { type: String, required: false }
});

const requirenteSch = new Schema({
    userId: { type: String, required: false },
    personId: { type: String, required: false },
    slug: { type: String, required: false },
});


const materialSch = new Schema({
    tmaterial: { type: String, required: false },
    identificador: { type: String, required: false },
    destino: { type: String, required: false },
    fondodocumental: { type: String, required: false },
    seriedocumental: { type: String, required: false },
    numeropieza: { type: String, required: false },
    titulo: { type: String, required: false },
    timescode: { type: String, required: false },
    fecha: { type: String, required: false },
});

const asesoramTecnicoSch = new Schema({
    institucion: { type: String, required: false },
    cuit: { type: String, required: false },
    solicitud: { type: String, required: false },
    contacto: { type: String, required: false },
    telefono: { type: String, required: false }
});

const paseSch = new Schema({
    fe_nov: { type: String, required: false },
    ho_nov: { type: String, required: false },
    fets_nov: { type: Number, required: false },
    ejecucion: { type: String, required: false },
    emisor: { type: String, required: false },
    novedadTx: { type: String, required: false },

    isCumplida: { type: Boolean, required: false }, //ESTADO TIENE QUE ESTAR EN CUMPLIDO

    //Inicio de pases
    sector: { type: String, required: false },
    estado: { type: String, required: false },
    paseTx: { type: String, required: false },
    //Fin pases

    atendidox: { type: atendidoxSch, required: false },

});

/**
 * Creación de un Schema
 * @params
 */
const consultaSch = new Schema({
    isActive: { type: Boolean, required: false },
    type: { type: String, required: false },

    //intervencion: { type: String, required: false },
    urgencia: { type: String, required: false },

    fecomp_txa: { type: String, required: false },
    fecomp_tsa: { type: Number, required: false },

    description: { type: String, required: false },
    sector: { type: String, required: false },

    hasNecesidad: { type: Boolean, required: false },
    fe_necesidad: { type: String, required: false },
    fets_necesidad: { type: Number, required: false },

    hasCumplimiento: { type: Boolean, required: false },

    estado: { type: String, required: false },
    // avance: { type: String, required: false },
    ejecucion: { type: String, required: false },

    pases: [paseSch],

    // atendidox: { type: atendidoxSch, required: false },
    requirente: { type: requirenteSch, required: false },

    asesoramiento: { type: asesoramTecnicoSch, required: false },
    material: { type: [materialSch], required: false, default: [] },
});


consultaSch.pre('save', function(next) {
    return next();
});


function buildQuery(query) {
    let q = {};

    if (query['type']) {
        q["type"] = query['type'];
    }

    if (query['modoconsulta']) {
        // consulta: consultaturno, consulta
        // servicio: solmaterial, asesoramiento
        if (query['modoconsulta'] === 'consulta') {
            q["type"] = { $in: ['consulta', 'consultaturno'] }
        }
        if (query['modoconsulta'] === 'servicio') {
            q["type"] = { $in: ['solmaterial', 'asesoramiento'] }
        }
    }

    if (query['userId']) {
        q["requirente.userId"] = query['userId'];
    }

    if (query.fechaDesde && query.fechaHasta) {
        //q['$and'] = [{ 'fecomp_tsa': { '$gte': parseInt(query.fechaDesde, 10), '$lt': parseInt(query.fechaHasta, 10) } }];
        q['fecomp_tsa'] = { '$gte': parseInt(query.fechaDesde, 10), '$lt': parseInt(query.fechaHasta, 10) };
    } else {
        if (query.fechaDesde) {
            q['fecomp_tsa'] = { "$gte": parseInt(query.fechaDesde, 10) };
        }

        if (query.fechaHasta) {
            q['fecomp_tsa'] = { "$lt": parseInt(query.fechaHasta, 10) };
        }
    }

    if (query.estado) {
        q['estado'] = query.estado;
    }

    if (query.sector) {
        q['sector'] = query.sector;
    }

    if (query.ejecucion) {
        q['ejecucion'] = query.ejecucion;
    }

    console.log("buildQuery [%o]", q)
    return q;
}


/**
 * El Modelo es el objeto constructor de instancias concretas
 * se obtiene a partir del Schema
 * @param String: nombre del Modelo
 * @param Schema: Schema a partir del cual crear el modelo
 * @param String: nombre a asignar a las colecciones de modelos (en plural)
 */
const Record = mongoose.model('Consulta', consultaSch, 'consultas');


/**
 * Retrieve all records
 * @param cb
 * @param errcb
 */
exports.findAll = function(errcb, cb) {
    Record.find(function(err, entities) {
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
exports.findByQuery = function(query, errcb, cb) {
    let regexQuery = buildQuery(query)

    Record.find(regexQuery).lean().exec(function(err, entities) {
        if (err) {
            console.log('[%s] findByQuery ERROR: [%s]', whoami, err)
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
exports.findById = function(id, errcb, cb) {

    Record.findById(id, function(err, entity) {
        if (err) {
            console.log('[%s] findByID ERROR() argument [%s]', whoami, arguments.length);
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
exports.update = function(id, record, user, errcb, cb) {
    Record.findByIdAndUpdate(id, record, { new: true }, function(err, entity) {
        if (err) {
            console.log('[%s] validation error as validate() argument [%s]', whoami)
            err.itsme = whoami;
            errcb(err);
        } else {
            //updateAvance(entity, id, user);
            buildAndSendConsultaEmail(entity);
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
exports.create = function(record, errcb, cb) {
    delete record._id;

    Record.create(record, function(err, entity) {
        if (err) {
            console.log('[%s] validation error as validate() argument ', whoami);
            err.itsme = whoami;
            errcb(err);

        } else {
            // buildAndSendConsultaEmail(entity);
            cb(entity);
        }
    });

};


/******************************************************************************
 * Mailing y gestión de correo electrónico
 */

function buildConsultaEmail(data) {
    const template = `
    <p>¡Hola,  ${data.displayName}!</p>
    <p>Respondimos la consulta que nos realizaste.</p>
    <p>Podés visualizarla ingresando <a target="_blank" href="https://agnbicentenario.mininterior.gob.ar/web/usuario/dashboard/consultas">acá</a>.</p>
  `;

    return template;
}

function buildAndSendConsultaEmail(consulta) {
    personas.findByQuery({ userId: consulta.requirente.userId }, function(error) {
        console.log(error);
    }, function(person) {
        if (person && person.length > 0) {
            const body = buildConsultaEmail({
                displayName: person[0].displayName,
                email: person[0].email
            });

            const mailOpt = {
                from: config.mailing.from,
                body: body,
                to: person[0].email,
                prefix: config.mailing.prefix,
                subject: config.mailing.subjects.notification
            };
            sendNotificationEmail(mailOpt);
        }
    });
}

function sendNotificationEmail(mailOptions) {
    const mail = mailer.mailFactory(mailOptions);

    mailer.sendMail(mail.content, function(error) {
            console.log('Error al enviar correo elecrónico: %o', error);
        },
        function(success) {
            //c onsole.log('Se envió correo electrónico al usuario: %o', success);
        });
}
