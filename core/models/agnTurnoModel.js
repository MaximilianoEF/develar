const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const utils = require('../services/commons.utils');
const config = require('../config/config');
const Excel = require('exceljs')
const usuarios = require('./agnUsuarioWebModel');
const personas = require('./personModel');
const mailer = require('../services/sendmail');

const TURNOCALENDAR_HORIZON = 30;

/**
 * Slots de turnos
 *
 * sede: nombre de la sede para el que se establecen las plazas
 * capacidad: cantidad de asistentes para un horario determinado
 * estado: estado del slot (activo, cancelado, etc)
 * duracion: la duración de un turno dado en este slot, en minutos
 * thorario: tipo de horario; puede valor 0=puntoual o 1=hora y duracion
 * dow: día de la semana correspondiente al slot
 * hora: la hora puntual con que corresponde el slot
 */
 const turnoNominalSch = new Schema({
    nombreturno: { type: String, required: true },
    sede: { type: String, required: true },
    capacidad: { type: Number, required: true },

    dow: { type: Number, required: false, default: 0 },
    hora: { type: Number, required: false, default: 0 },
    minutos: { type: Number, required: false },
    duracion: { type: Number, required: false, default: 0 },

    slug: { type: String, required: false },
    estado: { type: String, required: false, default: 'activo' },

    slotId: { type: String, required: false }
});

/**
 * Dada una fecha puntual, construye el rango en timestamp para la fecha
 *
 * @param {string} dateTx Es la fecha puntual, por ej: 11/10/2020
 */
function buildDayRangeQuery(field, dateTx) {
    let q = {};

    const fechaInicio = utils.parseDateStr(dateTx);
    const fechaFin = utils.parseDateStr(dateTx + ' 23:59');

    q[field] = {
        '$gte': parseInt(fechaInicio.getTime(), 10),
        '$lte': parseInt(fechaFin.getTime(), 10)
    };

    return q;
}


/**
 * Crea un turno ('turno asignado') con los datos dados como parámetro
 *
 * @param {*} data
 * @param {*} turno
 * @param {*} errorCallback
 * @param {*} successCallback
 */
const assignTurno = function(data, turno, errorCallback, successCallback) {
    //c onsole.log('assignTurno data [%o], turno [%o]', data, turno);

    let asignado = new Turno();
    asignado.turnoId = turno._id;
    asignado.sede = turno.sede;
    asignado.tipoConsulta = data.tipoConsulta;
    asignado.estado = 'activo';
    asignado.avance = 'pendiente';
    asignado.detalle = data.detalle;
    asignado.txFecha = data.txFecha;
    asignado.txHora = data.txHora;
    asignado.tsFechaHora = utils.parseDateStr(data.fecha);
    asignado.requirente = data.requirente;
    //c onsole.log('assignTurno asignado [%o]', asignado);

    asignado.save().then(turnoAsignado => {
        if (turnoAsignado && successCallback) {
            successCallback(turnoAsignado);
        } else {
            errorCallback({ error: 'Al guardar el turno' });
        }
    })

}

/**
 * Verifica que haya lugar para alojar el turno elegido; es decir, que dado
 * un dia y hora, efectivamente se pueda crear el turno
 *
 * slots es el o los slots disponibles
 * asignados son los turnos que haya para ese día en esa sede
 * query es el nuevo turno que estoy intentando almacenar
 *
 */

const validateCupo = function(slots, asignados, query) {
    let filterList = slots.filter(slot => {
        // Con este reduce cuento cuántos turnos hay asignados en el slot elegido...
        let cantidadAsignados = asignados.reduce((cantidad, asignado) => {
            if (asignado.turnoId == slot._id) {
                cantidad = cantidad + 1;
            }
            return cantidad;
        }, 0);

        //c onsole.log('validateCupo[slot=%o, capacidad=%s, ocupados=%s]', slot, slot.capacidad, cantidadAsignados);

        // ...y si la cantidad supera la capacidad permitida, el slot es filtrado ('filter-out')
        if (cantidadAsignados >= slot.capacidad) {
            return false;
        } else {
            return true;
        };
    });

    return filterList;
}

const dowValidate = function(dow, target) {
    return !(dow !== target.dow);
}

const filterTurnos = function(query, tokens) {
    const resultSet = tokens.filter(turno => {
        let ok = true;
        if (query.txFecha) {
            let fechaBuscada = utils.parseDateStr(query.txFecha);
            let dow = fechaBuscada.getDay();


            //c onsole.log('en FilterTurnos, fechaBuscada -> %s, dow -> %s', fechaBuscada, dow);

            return dowValidate(dow, turno);
        }
        return ok;
    });

    return resultSet;
}

// Query es el turno que quiero validar
// Tokens son los slots disponibles para meter dicho turno
const validateTurnos = function(query, tokens, errorCallback, successCallback) {
    let resultSet = filterTurnos(query, tokens);
    let validatedSet = [];

    if (resultSet && resultSet.length > 0) {
        fetchTurnos(query).then(list => {
            validatedSet = validateCupo(resultSet, list, query);
            successCallback(validatedSet);
        });
    } else {
        successCallback([]);
    }
}

/**
 * Obtiene todos los turnos asignados según los criterios pasados en el
 *  objeto query
 *
 * @param {Object} query Los criterios para filtrar los turnos asignados
 */
const fetchTurnos = function(query) {
    let regexQuery = buildTurnosAsignadosQuery(query);
    return Turno.find(regexQuery);
}

const fetchNextTurno = function(query, errorCallback, successCallback) {
    let regexQuery = buildNextTurnoQuery(query);

    TurnoNominal.find(regexQuery, function(error, entities) {
        let results = [];
        if (error) {
            errorCallback(error);
        } else {
            if (entities && entities.length) {
                results = validateTurnos(query, entities, errorCallback, successCallback);
            } else {
                successCallback(results)
            }
        }
    })
}

const processTurno = function(query, errorCallback, successCallback) {
    fetchNextTurno(query,
        function(error) {

        },
        function(records) {
            if (records && records.length > 0) {
                let first = records[0];
                assignTurno(query, first, function(error) {},
                    function(turnoElegido) {
                        successCallback([turnoElegido] || []);
                    });
            } else {
                successCallback(records || []);
            }
        })
}

/**
 * Calcula y devuelve el primer turno disponible para una determinada sede
 *
 * @param {string} sede La sede para la que se busca un turno
 * @param {function} errorCallback
 * @param {function} successCallback
 */
exports.fetchFirstAvailableSlot = function(query, errorCallback, successCallback) {
    const { sede } = query;

    // Primero obtengo todos los slots para la sede buscada
    TurnoNominal.find({ estado: 'activo', sede: sede }, function(error, turnosDisponiblesList) {
        if (error) {
            errorCallback(error);
        } else {
            // Luego obtengo todos los turnos asignados para la sede buscada
            let sedesConCupo = [];
            fetchTurnos({ estado: 'activo', sede: sede }).then(turnosAsignadosList => {
                // Valido los cupos, es decir, me fijo los slots con turno
                // disponible
                sedesConCupo = validateCupo(turnosDisponiblesList, turnosAsignadosList);
                //c onsole.log('fetchFirstAvailableSlot[BEFORE SORT][sedesConCupo=%o]', sedesConCupo);

                sedesConCupo.sort((a, b) => {
                    return a.dow - b.dow;
                });

                //c onsole.log('fetchFirstAvailableSlot[AFTER SORT][sedesConCupo=%o]', sedesConCupo);

                // Luego me tengo que fijar en qué día la semana estamos
                const hoy = new Date();
                const nextDayWithOffsetDate = nextLaborDay(new Date(), 2);
                const nextAvailableDay = nextDayWithOffsetDate.getDay();

                // Filtro las sedesConCupo, el día de la semana debe ser mayor que
                // nextAvailableDay, que contiene el próximo 'day-of-the-week' laborable
                const primeraSedeLibre = sedesConCupo.find(sede => sede.dow >= nextAvailableDay);


                //c onsole.log('fetchFirstAvailableSlot[primeraSedeLibre=%o]', primeraSedeLibre);

                successCallback(primeraSedeLibre);
            });
        }
    });
}

/**
 * Obtiene los turnos nominales para una sede y fecha determinadas
 *
 * @param {*} query
 * @param {*} errorCallback
 * @param {*} successCallback
 */
exports.fetchAvailableSlots = function(query, errorCallback, successCallback) {
    //c onsole.log('fetchAvailableSlots[query=%o]', query);

    const { sede, dateTx } = query;
    const dow = utils.parseDateStr(dateTx).getDay();

    //c onsole.log('fetchAvailableSlots[sede=%s, dateTx=%s, dow=%s]', sede, dateTx, dow);
    TurnoNominal.find({ estado: 'activo', sede: sede, dow: dow }, function(error, turnosDisponiblesList) {
        if (error) {
            errorCallback(error);
        } else {
            // Luego obtengo todos los turnos asignados para la sede buscada
            let sedesConCupo = [];
            fetchTurnos({ sede: sede, dateTx: dateTx }).then(turnosAsignadosList => {
                // Valido los cupos, es decir, me fijo los slots con turno
                // disponible

                //c onsole.log('fetchAvailableSlots[turnosAsignadosList=%o]', turnosAsignadosList);

                sedesConCupo = validateCupo(turnosDisponiblesList, turnosAsignadosList);
                //c onsole.log('fetchFirstAvailableSlot[BEFORE SORT][sedesConCupo=%o]', sedesConCupo);

                sedesConCupo.sort((a, b) => {
                    return a.hora - b.hora;
                });
                //c onsole.log('fetchFirstAvailableSlot[AFTER SORT][sedesConCupo=%o]', sedesConCupo);

                // Luego me tengo que fijar en qué día la semana estamos
                const nextDayWithOffsetDate = nextLaborDay(new Date(), 2);
                const nextAvailableDay = nextDayWithOffsetDate.getDay();
                // c onsole.log('fetchFirstAvailableSlot[nextAvailableDay=%s]', nextAvailableDay);

                // Filtro las sedesConCupo, el día de la semana debe ser mayor que
                // nextAvailableDay, que contiene el próximo 'day-of-the-week' laborable
                // const primeraSedeLibre = sedesConCupo.find(sede => sede.dow >= nextAvailableDay);

                //c onsole.log('fetchFirstAvailableSlot[primeraSedeLibre=%o]', primeraSedeLibre);

                successCallback(sedesConCupo);
            });
        }
    });
}

// feriados
// const inactivosList = ["31/03/2020", "10/04/2020", "01/05/2020", "25/05/2020", "15/06/2020", "09/07/2020", "10/07/2020", "24/12/2020", "25/12/2020", "31/12/2020", "01/01/2021"]
const inactivosList = ["01/04/2021", "02/04/2021", "01/05/2021"];
const laborDayOfWeek = [0, 1, 1, 1, 1, 1, 0];

function nextLaborDay(date, offset) {
    let day = date.getDate();
    let m = date.getMonth();
    let y = date.getFullYear();
    let blackList = inactivosList.map(t => utils.parseDateStr(t));

    for (let i = 0; i < 10; i += 1) {
        let dd = day + i + offset;
        let test = new Date(y, m, dd);
        if (laborDayOfWeek[test.getDay()]) {
            let inac = blackList.find(t => t.getTime() == test.getTime())
            if (!inac) return test;
        }
    }
    return null;
}

exports.processTurno = processTurno;
exports.fetchNextTurno = fetchNextTurno;
exports.assignTurno = assignTurno;


/******************************************************************************/


const atendidoxSch = new Schema({
    userAdmId: { type: String, required: false },
    userWebId: { type: String, required: false },
    slug: { type: String, required: false }
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

const requirenteTurnoSch = new Schema({
    personId: { type: String, required: true },
    userId: { type: String, required: true },
    displayName: { type: String, required: false },
    ndoc: { type: String, required: false }
});

const agnTurnoSch = new Schema({
    // ID del slot donde se asignará este turno
    turnoId: { type: String, required: false },
    sede: { type: String, required: true },
    sala: { type: String, required: true },
    slotId: { type: String, required: false },
    tipoConsulta: { type: String, required: false },
    estado: { type: String, required: false },
    avance: { type: String, required: false },
    detalle: { type: String, required: false },
    txFechaAlta: { type: String, required: false, default: utils.dateToStr(new Date()) },
    txFecha: { type: String, required: false },
    txHora: { type: String, required: false },
    duracion: { type: Number, required: false },
    tsFechaHora: { type: Number, required: false },
    tsFechaAlta: { type: Number, required: false, default: Date.now() },
    requirente: { type: requirenteTurnoSch, required: false },
    source: { type: String, required: false },
    pases: { type: [paseSch], required: false, default: [] }
});


/******************************************************************************
 * Funciones utilitarias
 *
 */

function buildQuery(query) {
    let q = {};

    if (query.sede) {
        q['sede'] = query.sede;
    }

    if (query.tipoConsulta) {
        q['tipoConsulta'] = query.tipoConsulta;
    }

    if (query.fechaDesde && query.fechaHasta) {
        q['tsFechaHora'] = { "$gte": parseInt(query.fechaDesde, 10), "$lte": parseInt(query.fechaHasta, 10) };
    }

    if (query.fechaDesde && query.fechaHasta) {
        q['tsFechaHora'] = { "$gte": parseInt(query.fechaDesde, 10), "$lte": parseInt(query.fechaHasta, 10) };
    }


    if (query.estado) {
        q['estado'] = query.estado;
    }

    if (query.avance) {
        q['avance'] = query.avance;
    }

    if (query.userId) {
        q['requirente.userId'] = query.userId;
    }

    return q;
}

agnTurnoSch.pre('save', function(next) {
    next();
});


const Turno = mongoose.model('AgnTurnoWeb', agnTurnoSch, 'turnosasignados');
const TurnoNominal = mongoose.model('AgnTurnoWebDisponible', turnoNominalSch, 'turnosnominales');

/******************************************************************************
 * Métodos públicos
 *
 */

exports.create = function(data, errorCallback, successCallback) {
    fetchAllWithAvailability(data.slotId, errorCallback, (result) => {
        const slots = result.data;
        if (slots[data.txFecha]) {
            let hourAux = new Date(data.tsFechaHora).getHours();
            if (slots[data.txFecha].find(f => f.horaNum === hourAux)) {
                Turno.create(data, function(error, result) {
                    if (error) {
                        errorCallback(error);
                    } else {
                        successCallback(result);
                    }
                });
            } else {
                errorCallback("No hay turnos disponibles")
            }
        } else {
            errorCallback("No hay turnos disponibles");
        }
    });
}

exports.update = function(id, data, errorCallback, successCallback) {
    Turno.findByIdAndUpdate(id, data, { new: true }, function(error, entity) {
        if (error) {
            errorCallback(error);
        } else {
            const avancesConMail = ['confirmado', 'canceladoagn', 'canceladousuario'];
            if (avancesConMail.includes(entity.avance)) {
                buildAndSendTurnoEmail(entity);
            }
            successCallback(entity);
        }
    });
}

exports.delete = function(id, errorCallback, successCallback) {
    Turno.findByIdAndDelete(id, function(error, result) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(result);
        }
    });
}

exports.findAll = function(errorCallback, successCallback) {
    Turno.find().sort({ tsFechaHora: -1 }).lean().exec(function(error, result) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(result);
        }
    });
}

exports.findAllByPerson = function(personId, errorCallback, successCallback) {
    Turno.find({ 'requirente.personId': personId }).lean().exec(function(error, results) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(results);
        }
    });
}

exports.findAllByUser = function(userId, errorCallback, successCallback) {
    Turno.find({ 'requirente.userId': userId }).lean().exec(function(error, results) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(results);
        }
    });
}

exports.findById = function(id, callback) {
    Turno.findById(id, function(error, user) {
        callback(error, user);
    });
}

exports.findDisponibleById = function(id, errorCallback, successCallback) {

    TurnoNominal.findById(id, function(error, entity) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(entity);
        }
    })
}

exports.findByQuery = function(query, errorCallback, successCallback) {
    let regexQuery = buildQuery(query);

    console.dir(regexQuery);

    Turno.find(regexQuery).sort({ tsFechaHora: -1 }).lean().exec(function(error, results) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(results);
        }
    });
}

/******************************************************************************
 * Exportación de datos a planilla de XLSX
 */
exports.exportarMovimientos = function(query, req, res) {
    fetchMovimientos(query, req, res);
}

function fetchMovimientos(query, req, res) {
    const regexQuery = buildQuery(query);
    //c onsole.log('fetchMovimientos regexQuery -> %o', regexQuery);

    Turno.find(regexQuery).lean().exec(function(error, results) {
        if (error) {
            console.error(error);
        } else {
            if (results && results.length) {
                dispatchExcelStream(results, query, req, res);
            }
        }
    })
}

function dispatchExcelStream(results, query, req, res) {
    buildExcelStream(results, query, req, res);
}

function buildExcelStream(turnos, query, req, res) {
    let today = Date.now();
    let filename = 'turnosweb_' + today + '.xlsx'

    res.writeHead(200, {
        'Content-Disposition': 'attachment; filename="' + filename + '"',
        'Transfer-Encoding': 'chunked',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    var workbook = new Excel.stream.xlsx.WorkbookWriter({ stream: res })
    var worksheet = workbook.addWorksheet('turnosWeb')

    worksheet.addRow(['Turnos Web']).commit()
    worksheet.addRow(['Fecha de emisión', new Date().toString()]).commit()
    worksheet.addRow().commit()
    worksheet.addRow(['Fecha turno', 'Hora turno', 'Nombre y apellido', 'Documento Nº', 'Tipo Consulta', 'Sede', 'Estado', 'Avance', 'Detalle']).commit();

    turnos.forEach((row, index) => {
        const { txFecha, txHora, tipoConsulta, sede, estado, avance, detalle } = row;
        const displayName = row.requirente.displayName;
        const ndoc = row.requirente.ndoc;

        let turnoArray = [txFecha, txHora, displayName, ndoc, tipoConsulta, sede, estado, avance, detalle];

        worksheet.addRow([...turnoArray]).commit()
    })

    worksheet.commit()
    workbook.commit()
}

/******************************************************************************
 * Mailing y gestión de correo electrónico
 */

function buildConfirmacionTurnoEmail(data) {
    const template = `
      <p>¡Hola,  ${data.displayName}!</p>
      <p>Te confirmamos que tu turno fue asignado con éxito.</p>

      <p>Día: ${data.txFechaLong}</p>
      <p>Horario: ${data.txHoraLong} hs.</p>

      <p>Recordá que para ingresar y permanecer en nuestras instalaciones deberás utilizar barbijo en todo momento. Siguiendo los protocolos vigentes, al ingreso se te controlará la temperatura y se te brindará alcohol sanitizante para las manos.</p>

      <p>En caso de que no puedas asistir, te pedimos que canceles el turno con 24 horas de antelación.</p>
      `;

    return template;
}

function buildCancelacionUsuarioTurnoEmail(data) {
    const template = `
      <p>¡Hola,  ${data.displayName}!</p>

      <p>Cancelaste con éxito el turno que solicitaste previamente. Si necesitas solicitar un nuevo turno ingresá en la sección <b>Solicitar turno</b> de la plataforma. También podés acceder haciendo click <a target="_blank" href="https://agnbicentenario.mininterior.gob.ar/web/usuario/dashboard/turnospresenciales">acá</a>.</p>
      `;

    return template;
}

function buildCancelacionAGNTurnoEmail(data) {
    const template = `
      <p>¡Hola,  ${data.displayName}!</p>

      <p>El turno que solicitaste fue cancelado por AGN debido a motivos de fuerza mayor. Te pedimos que nos escribas <a target="_blank" href="https://agnbicentenario.mininterior.gob.ar/web/usuario/dashboard/consultas">acá</a> para obtener mayor información.</p>
      `;

    return template;
}

function buildAndSendTurnoEmail(turno) {
    //usuarios.findById(turno.requirente.userId, function(error, user) {
    personas.findByQuery({ userId: turno.requirente.userId }, function(error) {
        console.error(error);
    }, function(person) {
        if (person && person.length > 0) {
            const bodyOptions = {
                displayName: turno.requirente.displayName,
                email: person[0].email,
                txFecha: turno.txFecha,
                txHora: turno.txHora,
                txFechaLong: utils.longStrFromNum(turno.tsFechaHora),
                txHoraLong: utils.strFromDateInterval(turno.tsFechaHora, 'minute', turno.duracion),
                sede: turno.sede,
                turnoId: turno._id
            };

            let body;
            let subject;

            switch (turno.avance) {
                case 'confirmado':
                    body = buildConfirmacionTurnoEmail(bodyOptions);
                    subject = config.mailing.subjects.confirmed
                    break;
                case 'canceladousuario':
                    body = buildCancelacionUsuarioTurnoEmail(bodyOptions);
                    subject = config.mailing.subjects.cancelled
                    break;
                case 'canceladoagn':
                    body = buildCancelacionAGNTurnoEmail(bodyOptions);
                    subject = config.mailing.subjects.cancelled
                    break;
            }


            const mailOptions = {
                from: config.mailing.from,
                body: body,
                to: person[0].email,
                prefix: config.mailing.prefix,
                subject
            };
            sendNotificationEmail(mailOptions);
        }
    });
}

function sendNotificationEmail(mailOptions) {
    const mail = mailer.mailFactory(mailOptions);

    mailer.sendMail(mail.content, function(error) {
            console.error('Error al enviar correo elecrónico: %o', error);
        },
        function(success) {
            //c onsole.log('Se envió correo electrónico al usuario: %o', success);
        });
}

/******************************************************************************
 * ALGORITMO: Calcula y devuelve 'on-the-fly' los turnos disponibles
 */
function fetchAllWithAvailability(slotId, errorCb, successCb) {
    console.log('CALLING fetchAllWithAvailability function; params: slotId[%s]', slotId);

    /* Paso 1: obtener los turnos nominales */
    console.log('slotId: [%s]', slotId);

    TurnoNominal.find(). 
    where('slotId').equals(slotId).
    where('estado').equals('activo').
    lean().exec(function(error, nominalResults) {
        if (nominalResults) {
            console.log('TurnoNominal.find found -> %s nominalResults', nominalResults.length);
            //c onsole.dir(nominalResults);
            const nominalResultsFound = nominalResults.length;

            let availableSlots = new Map();
            const startDate = new Date();
            let horizon = TURNOCALENDAR_HORIZON;

            for (let k = 0; k < nominalResultsFound; k++) {
                console.log('nominal:[%s] param:[%s]  isEqual: [%s]',nominalResults[k].slotId, slotId, nominalResults[k].slotId === slotId)
                while (horizon >= 0) {
                    let nextDate = nextLaborDay(startDate, (horizon + 2));
                    let nominalHourStr = nominalResults[k].slug;
                    let nominalHourNum = nominalResults[k].hora;
                    let nominalMinutesNum = nominalResults[k].minutos;
                    let freeCapacity = nominalResults[k].capacidad;
                    let duration = nominalResults[k].duracion;

                    if (nextDate.getDay() === nominalResults[k].dow) {
                        let nextDateStr = utils.dateToStr(nextDate);

                        let nextDateValue = [{
                            slug: nominalHourStr,
                            minutos: nominalMinutesNum,
                            horaNum: nominalHourNum,
                            capacidad: freeCapacity,
                            fecha: nextDateStr,
                            duracion: duration
                        }];

                        if (availableSlots.has(nextDateStr)) {
                            let actualValue = availableSlots.get(nextDateStr);

                            if (!actualValue.find(item => item.slug === nominalHourStr)) {
                                actualValue.push(nextDateValue[0]);
                                availableSlots.set(nextDateStr, actualValue);
                            }
                        } else {
                            availableSlots.set(nextDateStr, nextDateValue);
                        }
                    }
                    horizon--;
                }
                horizon = TURNOCALENDAR_HORIZON;
            }
            // Fin paso 1

            /*
              2) Obtener todos los slots asignados, con los siguientes criterios:
                 - El slot asignado debe estar en estado 'activo'
             */
            //c onsole.log('Obteniendo todos los turnos asignados entre %s y %s', utils.dateToStr(searchStartDate), utils.dateToStr(searchEndDate));

            Turno.find(). //Ver si se puede refinar el Find para levantar Turnos con fechas posterior al startDay
                //where('tsFechaHora').gt(searchStartDate.getTime()).
                //where('tsFechaHora').lt(searchEndDate.getTime()).
            where('slotId').equals(slotId).
            where('estado').equals('activo').
            lean().exec(function(error, results) {
                if (error) {
                    // c onsole.log('se rompió todo: %o', error);
                } else {
                    /*
                    El próximo (y último) paso es comparar el campo txFecha con la
                    correspondiente clave en sortedAvailableSlots, y txHora con
                    el correspondiente valor. Bajo estas condiciones, se resta un item
                    del valor de la capacidad nominal
                     */
                    if (results && results.length > 0) {
                        const resultsFound = results.length;
                        //c onsole.log('============= results =======================')
                        //c onsole.dir(results);

                        for (let i = 0; i < resultsFound; i++) {
                            let assignedDay = results[i].txFecha;
                            let assignedHour = new Date(results[i].tsFechaHora).getHours();

                            //c onsole.log('iteramos los resultados encontrados.. assignedDay es %s and assignedHour es %s', assignedDay, assignedHour);

                            if (availableSlots.has(assignedDay)) {
                                let originalValue = availableSlots.get(assignedDay);
                                let originalValueIndex = availableSlots.get(assignedDay).findIndex(day => day.horaNum === assignedHour);
                                // c onsole.log('Item hallado para assignedDay; originalValue es %o; originalValueIndex es %s', originalValue, originalValueIndex);
                                if (originalValueIndex !== -1) {
                                    originalValue[originalValueIndex].capacidad = parseInt(originalValue[originalValueIndex].capacidad, 10) - 1;
                                }
                                originalValue = originalValue.filter((item) => item.capacidad !== 0);
                                availableSlots.set(assignedDay, originalValue);
                            }
                        }
                    }

                    /** Este ciclo limpia el diccionario de entradas vacías, es decir,
                     * aquellos días para los que no hay horarios disponibles
                     */
                    availableSlots.forEach((item, index) => {
                        if (item.length === 0) {
                            availableSlots.delete(index);
                        }
                    });
                }

                let sortedAvailableSlots = new Map([...availableSlots].sort((f1, f2) => utils.dateNumFromTx(f1[0]) - utils.dateNumFromTx(f2[0])));
                successCb({ status: 'OK', data: Object.fromEntries(sortedAvailableSlots) });
            });
        } else {
            console.error('TurnoNominal.find found no results');
            errorCb({ status: 'ERRNONOMINAL' });
        }
    });
}

exports.fetchAllWithAvailability = fetchAllWithAvailability;
