const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const turnoTemplateItemSch = new Schema({
    dow: { type: Number, required: false, default: 0 },
    hora_tx: { type: String, required: false },
    hora: { type: Number, required: false, default: 0 },
    minutos: { type: Number, required: false },
    duracion: { type: Number, required: false, default: 0 },

    capacidad: { type: Number, required: true },
    slug: { type: String, required: false },
    estado: { type: String, required: false, default: 'activo' }
});

const auditSch = new Schema({
    userId: { type: String, required: false },
    usename: { type: String, required: false },
    ts_alta: { type: Number, required: false }
});

const turnoTemplateSch = new Schema({
    nombreturno: { type: String, required: true },
    sede: { type: String, required: true },
    sala: { type: String, required: false },
    estado: { type: String, required: false },
    type: { type: String, required: false },
    description: { type: String, required: false },
    slug: { type: String, required: false },
    novedad: { type: String, required: false },
    slug: { type: String, required: true },
    fechaalta_tx: { type: String, required: false },
    fechaalta_ts: { type: Number, required: false },
    slots: { type: [turnoTemplateItemSch], required: false },
    audit: { type: auditSch, required: false }
});


const TurnoTemplate = mongoose.model('TurnoTemplate', turnoTemplateSch, 'turnostemplate');
const TurnoNominal = mongoose.model('TurnoNominal', turnoNominalSch, 'turnosnominales');


function buildQuery(query) {
    let q = {};

    if (query.dow) {
        q['dow'] = query.dow;
    }

    if (query.sede) {
        q['sede'] = query.sede;
    }

    if (query.estado) {
        q['estado'] = query.estado;
    }

    if (query.type) {
        q['type'] = query.type;
    }

    return q;
}

exports.create = function(data, errorCallback, successCallback) {
    TurnoTemplate.create(data, function(error, created) {
        if (error) {
            errorCallback(error);
        } else {
            /** Regenerar colección de turnosnominales */
            buildTurnosNominales(created);
            successCallback(created);
        }
    });
}


exports.update = function(id, data, errorCallback, successCallback) {
    TurnoTemplate.findByIdAndUpdate(id, data, { new: true }, function(error, updated) {
        if (error) {
            errorCallback(error);
        } else {
            // updateTurnosNominales(updated);
            buildTurnosNominales(updated);
            successCallback(updated);
        }
    });
}

exports.delete = function(id, errorCallback, successCallback) {
    TurnoNominal.find({ slotId: id }, function(error, entities) {
        if (!error) {
            const idsToDelete = entities.map((entity) => entity._id);
            const filter = {
                '_id': {
                    '$in': idsToDelete
                }
            };
            TurnoNominal.deleteMany(filter).then((entities) => {
                console.log('Eliminados: %o', entities);
            })
        }
    });

    TurnoTemplate.findByIdAndDelete(id, function(error, deleted) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(deleted);
        }
    });
}

exports.findAll = function(errorCallback, successCallback) {
    TurnoTemplate.find().lean().exec(function(error, entities) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(entities);
        }
    });
}

exports.findById = function(id, callback) {
    TurnoTemplate.findById(id, function(error, entity) {
        callback(error, entity);
    });
}

exports.findByQuery = function(query, errorCallback, successCallback) {
    const regexQuery = buildQuery(query);

    TurnoTemplate.find(regexQuery).lean().exec(function(error, entities) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(entities);
        }
    });
}

function updateTurnosNominales(turnoTemplate) {
    const slots = turnoTemplate.slots;

    TurnoNominal.find({ slotId: turnoTemplate._id }, function(error, entities) {
        if (!error) {
            const currentIds = entities.map((entity) => entity._id);
            const slotIds = slots.map((slot) => slot._id);

            console.log('Estos slots me llegan (IDS): %o', slotIds);
            console.log('Estos slots yo tengo (IDS): %o', currentIds);

            const toDelete = currentIds.filter((id) => !slotIds.includes(id));

            console.log('To be deleted: %o', toDelete);

            const filter = {
                '_id': {
                    '$in': toDelete
                }
            };

            TurnoNominal.deleteMany(filter)
                .then((entities) => {
                    console.log('Eliminados: %o', entities);
                });
        }
    });

    slots.forEach((token) => {
        TurnoNominal.update({ _id: token._id }, token, { new: true, upsert: true }, function(error, entity) {
            if (error) {

            } else {}
        });
    });
}

function buildTurnosNominales(turnoTemplate) {
    const slots = turnoTemplate.slots;

    if (slots && slots.length > 0) {
        TurnoNominal.find({ slotId: turnoTemplate._id }, function(error, entities) {
            if (!error) {
                const currentIds = entities.map((entity) => entity._id);
                const slotIds = slots.map((slot) => slot._id);

                console.log('Estos slots me llegan (IDS): %o', slotIds);
                console.log('Estos slots yo tengo (IDS): %o', currentIds);

                const toDelete = currentIds.filter((id) => !slotIds.includes(id));

                console.log('To be deleted: %o', toDelete);

                const filter = {
                    '_id': {
                        '$in': toDelete
                    }
                };

                TurnoNominal.deleteMany(filter)
                    .then((entities) => {
                        console.log('Eliminados: %o', entities);
                    });
            }
        });

        slots.forEach((token) => {
            buildSlotRecord(turnoTemplate.nombreturno, turnoTemplate.sede, turnoTemplate._id, token);
        });
    } else {
        return;
    }

    function buildSlotRecord(nombreturno, sede, slotId, token) {
        console.log('buildSlotRecord(%s, %s, %s) token %o', nombreturno, sede, slotId, token);

        let turnoNominal = new TurnoNominal();

        turnoNominal.nombreturno = nombreturno;
        turnoNominal.sede = sede;
        turnoNominal.slotId = slotId;

        turnoNominal._id = token._id;
        turnoNominal.capacidad = token.capacidad;
        turnoNominal.estado = 'activo';
        // turnoNominal.duracion = 120; // Cada turno dura 2 horas máximo
        turnoNominal.duracion = token.duracion;
        // turnoNominal.thorario = 2;
        turnoNominal.dow = token.dow;
        turnoNominal.hora = token.hora;
        turnoNominal.minutos = token.minutos;
        turnoNominal.slug = token.slug;
        // turnoNominal.franja = token.franja;

        /*
         */
        TurnoNominal.updateOne({ _id: turnoNominal._id }, turnoNominal, { new: true, upsert: true }, function(error, entity) {
            if (error) {

            } else {
                console.log('turnoNominal grabación exitosa: %s', entity);
            }
        });

        // turnoNominal.save()
        //     .then((entity) => {
        //         console.log('turnoNominal grabación exitosa: %s', entity);
        //     })
        //     .catch((error) => console.log(error));
    }
}