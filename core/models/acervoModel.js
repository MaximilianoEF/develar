const mongoose = require('mongoose');
const utils = require('../services/commons.utils');
const consultasAcervo = require('../models/consultasAcervoModel');
const Schema = mongoose.Schema;
const Excel = require('exceljs');
const MAX_RESULTS = 15000;

/**
 * Una collection representa un conjunto de uno o más archivos
 * -archives-
 *
 */

const collectionSch = new Schema({
    collectionId: { type: Number, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
})

/**
 * Datos sobre el fondo al que pertenece un determinado archive (ahora acervo)
 *
 */

const fondoSch = new Schema({
    coleccion: { type: [collectionSch], required: false },
    legajo_numero: { type: String, required: false },
    legajo_resumen: { type: String, required: false },
    id_externo: { type: String, required: false },
    vida_record_id: { type: Number, required: false }
});

/**
 * Metadata: metadatos que caracterizan al documento digital correspondiente
 * a un determinado acervo
 *
 */
const metadataSch = new Schema({
    timecode: { type: String, required: false },
    tape_master_numero: { type: Number, required: false },
    observacion_preparacion: { type: String, required: false },
    observacion_digitalizacion: { type: String, required: false },
    transcripcion: { type: String, required: false },
    puesta_audiovisual: { type: String, required: false },
    titulo_formal: { type: String, required: false },
    sonido: { type: Number, required: false },
    subtitulos: { type: Number, required: false },
    duracion: { type: String, required: false },
    color: { type: Number, required: false },
    derechos: { type: String, required: false },
    active: { type: Number, required: false },
    created: { type: String, required: false },
    modified: { type: String, required: false },
    coleccion: { type: String, required: false },
    temas_raw: { type: String, required: false },
    observacion_cinecolor: { type: String, required: false },
    custom1: { type: String, required: false },
    nroprocdigital: { type: String, required: false },
    motivos_visuales: { type: String, required: false },
    lado: { type: String, required: false },
    track: { type: String, required: false },
    fecha_grabacion: { type: Date, required: false },
    fecha_filmacion: { type: Date, required: false },
    fecha_ingreso: { type: Date, required: false },
    fecha_digitalizacion: { type: Date, required: false },
    velocidad: { type: String, required: false },
    created_administrador_id: { type: Number, required: false },
    modified_administrador_id: { type: Number, required: false }
});


/**
 * Materials: fuentes a partir de las que se genera el material digital
 * que luego pasará a almacenarse en un archivo -archive-
 *
 */

const materialTypeSch = new Schema({
    materialTypeId: { type: Number, required: false },
    title: { type: String, required: false }
});

const materialSch = new Schema({
    materialId: { type: Number, required: false },
    type: { type: materialTypeSch, required: false },
    id_externo: { type: String, required: false },
    formato: { type: String, required: false },
    tambor: { type: Number, required: false },
    copias: { type: String, required: false },
    actos: { type: String, required: false },
    items: { type: Number, required: false },
    ubicacion: { type: String, required: false },
    conservacion: { type: String, required: false },
    observacion: { type: String, required: false },
    metraje: { type: Number, required: false },
    numero: { type: Number, required: false },
    duracion: { type: Number, required: false },
    soporte: { type: String, required: false },
    coleccion: { type: String, required: false },
    titulo_formal: { type: String, required: false }
});

/**
 * Artist: personajes que aparecen en el material asociado al archivo
 *
 */

const artistRoleSch = new Schema({
    artistRoleId: { type: Number, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});

const artistSch = new Schema({
    artistId: { type: Number, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    active: { type: Number, required: false },
    role: { type: artistRoleSch, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});

/**
 * Languages: idiomas que aparecen en el material asociado al archivo
 *
 */

const languageSch = new Schema({
    languageId: { type: Number, required: false },
    title: { type: String, required: false },
    isocode3: { type: String, required: false },
    isocode2: { type: String, required: false },
    title_spanish: { type: String, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});

/**
 * Timecodes: marcas de tiempo para un recurso de audio o video
 *
 */

const timecodeSch = new Schema({
    timecodeId: { type: Number, required: false },
    archiveid: { type: Number, required: false },
    code: { type: String, required: false },
    active: { type: Number, required: false },
    title: { type: String, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});

/**
 * Un Theme es un tipo de índice (temático, onomástico, etcétera)
 *
 */

const themeTypeSch = new Schema({
    themeTypeId: { type: Number, required: false },
    title: { type: String, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});

const themeSch = new Schema({
    themeId: { type: Number, required: false },
    title: { type: String, required: false },
    themeType: { type: themeTypeSch, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});


/**
 * Descripción de un archivo -archive-
 *
 */

const documentSch = new Schema({
    documentId: { type: Number, required: false },
    title: { type: String, required: false },
    contents: { type: String, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});


/**
 * Género de un archivo -archive-
 *
 */

const genreSch = new Schema({
    genreId: { type: Number, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});


/**
 * Es un documento auxiliar que acompaña a un archivo -archive-
 *
 */

const fileTypeSch = new Schema({
    fileTypeId: { type: Number, required: false },
    title: { type: String, required: false }
});

const attachmentSch = new Schema({
    attachmentId: { type: Number, required: false },
    fileType: { type: fileTypeSch, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    fileHash: { type: String, required: false },
    fileName: { type: String, required: false },
    fileExt: { type: String, required: false },
    fileSize: { type: Number, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});

/**
 * Un Resource es un documento digital principal, un documento
 * digital propiamente dicho, asociado a un determinado Archivo;
 * típicamente es un archivo de audio o video
 */

const resourceTypeSch = new Schema({
    resourceTypeId: { type: Number, required: false },
    title: { type: String, required: false },
    active: { type: Number, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});

const resourceSch = new Schema({
    resourceId: { type: Number, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    path: { type: String, required: false },
    resourcetype: { type: resourceTypeSch, required: false },
    created: { type: Date, required: false },
    modified: { type: Date, required: false }
});


/**
 * Acervo: es el documento principal.
 *
 */

const acervoSch = new Schema({
    fondo: { type: fondoSch, required: false },
    metadatos: { type: metadataSch, required: false },
    assets: { type: [resourceSch], required: false },
    documentos: { type: [documentSch], required: false },
    attachments: { type: [attachmentSch], required: false },
    temas: { type: [themeSch], required: false },
    timecodes: { type: [timecodeSch], required: false },
    languages: { type: [languageSch], required: false },
    artists: { type: [artistSch], required: false },
    materials: { type: [materialSch], required: false },
    genres: { type: [genreSch], required: false },
    stringify: { type: String, required: false },
    agn_log: { type: String, required: false }
});

const Acervo = mongoose.model('Acervo', acervoSch, 'acervos');

/************************************************
 * MÉTODOS PRIVADOS
 *
 */

function buildTextSearch(termino, tipoBusqueda) {
    // return { '$search': termino, '$language': 'es', '$caseSensitive': false, '$diacriticSensitive': false };
    return { '$search': termino, '$caseSensitive': false, '$diacriticSensitive': false };
}

function buildFiltroBusqueda(termino, tipoBusqueda) {
    if (tipoBusqueda === 'aprox') {
        // Si la frase tiene dos o mas terminos, cambia la logica de busqueda

        let normalized = utils.normalizeSpaces(termino);

        if (normalized.indexOf(' ') !== -1) {

            let multiw = utils.buildMultiWord(normalized)

            return { '$regex': utils.buildVowelsSingleWord(multiw), '$options': 'ig' };

        } else {

            return { '$regex': utils.buildVowelsSingleWord(normalized), '$options': 'ig' };

        }
    } else {
        return { '$regex': '\\b(' + utils.buildVowelsRegexp(termino) + ')\\b', '$options': 'ig' }; // termino;
    }
}

function buildFiltroStringify(termino, tipoBusqueda) {
    termino = utils.safeTextSearch(termino);

    if (tipoBusqueda === 'aprox') {
        // Si la frase tiene dos o mas terminos, cambia la logica de busqueda

        let normalized = utils.normalizeSpaces(termino);

        if (normalized.indexOf(' ') !== -1) {
            let multiw = utils.buildMultiWord(normalized)
            return { '$regex': utils.buildVowelsSingleWord(multiw), '$options': 'ig' };

        } else {

            return { '$regex': utils.buildVowelsSingleWord(normalized), '$options': 'ig' };
        }
    } else {
        return { '$regex': '\\b(' + termino + ')\\b', '$options': 'ig' }; // termino;
    }
}

function buildFiltroBusquedaYear(termino, tipoFecha) {
    if (tipoFecha === 'anio_filmacion') {
        return { '$eq': [{ '$year': '$metadatos.fecha_filmacion' }, Number.parseInt(termino)] };
    }

    if (tipoFecha === 'anio_grabacion') {
        return { '$eq': [{ '$year': '$metadatos.fecha_grabacion' }, Number.parseInt(termino)] };
    }

    if (tipoFecha === 'anio_digitalizacion') {
        return { '$eq': [{ '$year': '$metadatos.fecha_digitalizacion' }, Number.parseInt(termino)] };
    }
}

/**
 * Construye la query que luego se envia a MongoDB para realizar una busqueda
 *
 *
 * @param {Object} query Objeto con los parámetros de búsqueda recibidos desde el frontend
 */
function buildQuery(query) {

    let q = {};


    if (query.isArray === 'true') {
        q['$and'] = [];
        for (let index = 0; index < query.termino.length; index++) {
            let qry = {
                termino: query.termino[index],
                buscarEn: query.buscarEn[index],
                tipoBusqueda: query.tipoBusqueda[index],
                recurso : query.recurso
            }
            q['$and'].push(refactorQuery(qry));
        }
    } else {
        q = refactorQuery(query);
    }

    if (query.recurso && query.recurso !== '-1') {
        q['assets.resourcetype.resourceTypeId'] = query.recurso;
    }
    return q;
}

function refactorQuery(query) {
    let q = {};


    // Stringify (Todos los campos)
    if (query.buscarEn === 'all') {
        q['stringify'] = buildFiltroStringify(query.termino, query.tipoBusqueda);
    }

    // Título (palabra completa)
    if (query.buscarEn === 'alltext') {
        q['$text'] = buildTextSearch(query.termino, query.tipoBusqueda);
    }

    if (query.buscarEn === 'anio_filmacion_grabacion') {
        if (query.recurso === '-1') {
            q['$or'] = [
                { '$expr': buildFiltroBusquedaYear(query.termino, 'anio_filmacion') },
                { '$expr': buildFiltroBusquedaYear(query.termino, 'anio_grabacion') }
            ];
        } else if (query.recurso === '1') {
            q['$expr'] = buildFiltroBusquedaYear(query.termino, 'anio_filmacion');
        } else {
            q['$expr'] = buildFiltroBusquedaYear(query.termino, 'anio_grabacion');
        }
    }

    // if (query.buscarEn === 'anio_grabacion') {
    //     q['$expr'] = buildFiltroBusquedaYear(query.termino, 'anio_grabacion')
    // }

    if (query.buscarEn === 'anio_digitalizacion') {
        q['$expr'] = buildFiltroBusquedaYear(query.termino, 'anio_digitalizacion')
    }

    // Colección
    if (query.buscarEn === 'collection') {
        q['metadatos.coleccion'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
    }

    // Género
    if (query.buscarEn === 'genre') {
        q['genres.title'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
    }

    // ID de inventario (ID externo)
    if (query.buscarEn === 'id_externo') {
        q['$or'] = [
            { 'materials.id_externo': buildFiltroBusqueda(query.termino, query.tipoBusqueda) },
            { 'fondo.id_externo': buildFiltroBusqueda(query.termino, query.tipoBusqueda) }
        ];
    }

    // Indice onomástico (organización)
    if (query.buscarEn === 'institucion') {
        // themeTypeId = 2 indica que se trata de un ínidce onomástico (organización)
        q['temas.title'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
        q['temas.themeType.themeTypeId'] = 2;
    }

    // Transcripción del audio (timecodes)
    if (query.buscarEn === 'transcripcion') {
        q['timecodes.title'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
    }

    // Indice onomástico (persona)
    if (query.buscarEn === 'persona') {
        // themeTypeId = 1 indica que se trata de un ínidce onomástico (organización)
        q['temas.title'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
        q['temas.themeType.themeTypeId'] = 1;
    }

    // Productor
    if (query.buscarEn === 'productor') {
        // artistRoleId = 1 indica que se trata del productor
        q['artists.title'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
        q['artists.role.artistRoleId'] = 1;
    }

    // Puesta audiovisual
    if (query.buscarEn === 'puesta') {
        q['metadatos.puesta_audiovisual'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
    }


    // Serie (titulo de la serie)
    if (query.buscarEn === 'titulo_serie') {
        q['metadatos.coleccion'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
    }

    // Indice cronológico
    if (query.buscarEn === 'cronologico') {
        // themeTypeId = 3 indica que se trata de un índice cronológico
        q['temas.title'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
        q['temas.themeType.themeTypeId'] = 3;
    }

    // Indice geográfico
    if (query.buscarEn === 'geografico') {
        // themeTypeId = 4 indica que se trata de un índice geográfico
        q['temas.title'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
        q['temas.themeType.themeTypeId'] = 4;
    }


    // Indice temático
    if (query.buscarEn === 'motivos_tematicos') {
        // themeTypeId = 5 indica que se trata de un índice temático
        q['temas.title'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
        q['temas.themeType.themeTypeId'] = 5;
    }

    // Descripción (documento)
    // if (query.buscarEn === 'document') {
    //     q['documentos.contents'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
    // }

    // Nº de legajo
    if (query.buscarEn === 'legajo') {
        q['fondo.legajo_numero'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
    }

    // Título
    if (query.buscarEn === 'title') {
        q['metadatos.titulo_formal'] = buildFiltroBusqueda(query.termino, query.tipoBusqueda);
    }



    return q;
}

/**
 * Construye el campo stringify para un registro, utilizando los campos del
 * registro indicados por parámetro
 *
 * @param {Object} item El registro para el que se va a crear el campo stringified
 * @param {Array} fields Array de strings, cada uno es un nombre de un campo
 *
 * @returns false si error, en otro caso string con el contenido del campo stringified
 */
function buildStringifyField(item, fields = []) {
    let stringifiedArray = [];

    if (item.fondo.legajo_resumen) stringifiedArray.push(utils.safeStringify(item.fondo.legajo_resumen));
    if (item.metadatos.temas_raw) stringifiedArray.push(utils.safeStringify(item.metadatos.temas_raw));
    if (item.metadatos.titulo_formal) stringifiedArray.push(utils.safeStringify(item.metadatos.titulo_formal));
    if (item.metadatos.coleccion) stringifiedArray.push(utils.safeStringify(item.metadatos.coleccion));

    if (item.documentos && item.documentos.length > 0) {
        item.documentos.forEach((documento) => {
            stringifiedArray.push(utils.safeStringify(documento.title));
            stringifiedArray.push(utils.safeStringify(documento.contents));
        });
    }

    if (item.temas && item.temas.length > 0) {
        item.temas.forEach((tema) => {
            stringifiedArray.push(utils.safeStringify(tema.title));
        });
    }

    return stringifiedArray.join(" ");
}

/**********************************
 * MÉTODOS EXTERNOS :: Migración
 *
 */
exports.rebuildStringify = async function(errorCallback, successCallback) {
    try {
        const registros = await Acervo.find().lean().exec();

        //registros.forEach((item, index) => {
        for (k = 0; k < registros.length; k++) {
            // let stringifiedString = buildStringifyField(item);
            let stringifiedString = buildStringifyField(registros[k]);

            // await Acervo.updateOne({ _id: item._id }, {
            await Acervo.updateOne({ _id: registros[k]._id }, {
                $set: {
                    stringify: stringifiedString,
                    agn_log: new Date().getTime().toString()
                }
            });
        }
        //});

        successCallback(registros);
    } catch (error) {
        console.error(error.stack);
        errorCallback(error);
    }
}

exports.migrateDb = function(errorCallback, successCallback) {
    const Config = require('../config/config_agn.js');

    // *************************************************************************
    // Conexión y tratamiento de los datos desde MySQL
    //

    const mysql = require('mysql');
    const conexion = mysql.createConnection({
        host: Config.MySQL.host,
        user: Config.MySQL.usuario,
        password: Config.MySQL.password,
        database: Config.MySQL.database
    });

    /* ************************************************************************* */

    var fetchArchives = conexion.query('SELECT * FROM archives');

    fetchArchives
        .on('error', function(err) {
            // c onsole.error('Ocurrió un error: %s', err);
            errorCallback(err);
        })
        .on('result', function(registro) {
            conexion.pause();

            /**
             * corrige error:
             *
             * Unhandled rejection ValidationError: metadatos.fecha_grabacion: Cast to date failed for value "0000-00-00 00:00:00" at path "fecha_grabacion",
             */
            if (registro.fecha_grabacion === '0000-00-00 00:00:00') {
                registro.fecha_grabacion = null;
            }

            var acervo = {
                fondo: {
                    legajo_numero: registro.legajo_numero,
                    legajo_resumen: registro.legajo_resumen,
                    id_externo: registro.id_externo,
                    vida_record_id: registro.id,
                    coleccion: null
                },
                metadatos: {
                    timecode: registro.timecode,
                    tape_master_numero: registro.tape_master_numero,
                    observacion_preparacion: registro.observacion_preparacion,
                    observacion_digitalizacion: registro.observacion_digitalizacion,
                    transcripcion: registro.transcripcion,
                    puesta_audiovisual: registro.puesta_audiovisual,
                    titulo_formal: registro.titulo_formal,
                    sonido: registro.sonido,
                    subtitulos: registro.subtitulos,
                    duracion: registro.duracion,
                    color: registro.color,
                    derechos: registro.derechos,
                    active: registro.active,
                    temas_raw: registro.temas_raw,
                    observacion_cinecolor: registro.observacion_cinecolor,
                    custom1: registro.custom1,
                    nroprocdigital: registro.nroprocdigital,
                    motivos_visuales: registro.motivos_visuales,
                    lado: registro.lado,
                    track: registro.track,
                    velocidad: registro.velocidad,
                    coleccion: registro.coleccion,
                    fecha_grabacion: registro.fecha_grabacion,
                    fecha_filmacion: registro.fecha_filmacion,
                    fecha_ingreso: registro.fecha_ingreso,
                    fecha_digitalizacion: registro.fecha_digitalizacion,
                    created_administrador_id: registro.created_administrador_id,
                    modified_administrador_id: registro.modified_administrador_id,
                    created: registro.created,
                    modified: registro.modified
                },
                assets: [],
                documentos: [],
                attachments: [],
                temas: [],
                timecodes: [],
                languages: [],
                artists: [],
                materials: [],
                genres: []
            }

            insertNewAcervo(acervo);
            /**
             * A continuación obtengo las colecciones para un archivo
             *
             */

            var fetchCollectionsForArchive = conexion.query('SELECT * FROM collections c INNER JOIN archives_collections ac ON c.id = ac.collection_id AND ac.archive_id = ' + acervo.fondo.vida_record_id);
            fetchCollectionsForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var collection = {
                        collectionId: Number.parseInt(registro.id),
                        title: registro.title,
                        description: registro.title,
                        active: registro.active,
                        created: registro.created,
                        modified: registro.modified
                    }

                    updateAcervoCollection(acervo, collection);

                    conexion.resume();
                })

            /**
             * A continuación obtengo las assets para un archivo
             *
             */

            var fetchResourcesForArchive = conexion.query('select r.id, r.title, r.description, r.path, r.resourcetype_id, rt.id as rt_id, rt.active as rt_active, rt.created as rt_created, rt.modified as rt_modified, rt.title as rt_title from resources r inner join archives_resources ar on r.id = ar.resource_id inner join resourcetypes rt on r.resourcetype_id = rt.id where ar.archive_id =' + acervo.fondo.vida_record_id);
            fetchResourcesForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var resourceType = {
                        resourceTypeId: Number.parseInt(registro.rt_id),
                        title: registro.rt_title,
                        active: registro.rt_active,
                        created: registro.rt_created,
                        modified: registro.rt_modified
                    }

                    var resource = {
                        resourceId: Number.parseInt(registro.id),
                        title: registro.title,
                        description: registro.title,
                        path: registro.path,
                        resourcetype: resourceType
                    }

                    updateAcervoResources(acervo, resource);

                    conexion.resume();
                })

            /**
             * A continuación obtengo los documentos  para un archivo
             *
             */
            var fetchDocumentsForArchive = conexion.query('select d.id, d.title, d.contents, d.active, d.created, d.modified from documents d inner join archives_documents ad on d.id = ad.document_id where ad.archive_id = ' + acervo.fondo.vida_record_id);

            fetchDocumentsForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var document = {
                        documentId: Number.parseInt(registro.id),
                        title: registro.title,
                        contents: registro.contents,
                        active: registro.active,
                        created: registro.created,
                        modified: registro.modified
                    }

                    updateAcervoDocument(acervo, document);

                    conexion.resume();
                })


            /**
             * A continuación obtengo los attachments para un archivo
             *
             */
            var fetchAttachmentsForArchive = conexion.query('select a.id, a.filetype_id, a.title, a.description, a.file_hash, a.file_name, a.file_ext, a.file_size, a.active, a.created, a.updated, af.title as filetype_title from attachments a inner join archives_attachments `at` on a.id = at.attachment_id inner join filetypes af on a.filetype_id = af.id where at.archive_id = ' + acervo.fondo.vida_record_id);

            fetchAttachmentsForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var attachmentFileType = {
                        id: registro.filetype_id,
                        title: registro.filetype_title
                    }

                    var attachment = {
                        attachmentId: Number.parseInt(registro.id),
                        fileType: attachmentFileType,
                        title: registro.title,
                        description: registro.description,
                        fileHash: registro.file_hash,
                        fileName: registro.file_name,
                        fileExt: registro.file_ext,
                        active: registro.active,
                        created: registro.created,
                        modified: registro.modified
                    }

                    updateAcervoAttachment(acervo, attachment);

                    conexion.resume();
                })


            /**
             * A continuación obtengo los timecodes para un archivo
             *
             */
            var fetchTimecodesForArchive = conexion.query('select t.id, t.archive_id, t.code, t.active, t.title, t.created, t.modified from timecodes t where t.archive_id = ' + acervo.fondo.vida_record_id);

            fetchTimecodesForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var timecode = {
                        timecodeId: Number.parseInt(registro.id),
                        archiveid: registro.archive_id,
                        code: registro.code,
                        active: registro.active,
                        title: registro.title,
                        created: registro.created,
                        modified: registro.modified
                    }

                    updateAcervoTimecode(acervo, timecode);

                    conexion.resume();
                })



            /**
             * A continuación obtengo los artistas para un archivo
             *
             */
            var fetchArtistsForArchive = conexion.query('select a.id, a.title, a.description, a.active, a.created, a.modified, r.id as role_id, r.title as role_title, r.description as role_description, r.active as role_active, r.created as role_created, r.modified as role_modified from artists a inner join archives_artists aa on a.id = aa.artist_id inner join roles r on r.id = aa.role_id where aa.archive_id = ' + acervo.fondo.vida_record_id);

            fetchArtistsForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var artistRole = {
                        artistRoleId: Number.parseInt(registro.role_id),
                        title: registro.role_title,
                        description: registro.role_description,
                        active: registro.role_active,
                        created: registro.role_created,
                        modified: registro.role_modified
                    }

                    var artist = {
                        artistId: Number.parseInt(registro.id),
                        title: registro.title,
                        description: registro.description,
                        active: registro.active,
                        role: artistRole,
                        created: registro.created,
                        modified: registro.modified
                    }


                    updateAcervoArtist(acervo, artist);

                    conexion.resume();
                })

            /**
             * A continuación obtengo los índices -themes- para un archivo
             *
             */
            var fetchThemesForArchive = conexion.query('select t.id, t.title, t.active, t.created, t.modified, tt.id as themetype_id, tt.title as themetype_title, tt.active as themetype_active, tt.created as themetype_created, tt.modified as themetype_modified from themes t inner join archives_themes `at` on t.id = at.theme_id inner join themetypes tt on tt.id = t.themetype_id where at.archive_id = ' + acervo.fondo.vida_record_id);

            fetchThemesForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var themeType = {
                        themeTypeId: registro.themetype_id,
                        title: registro.themetype_title,
                        active: registro.themetype_active,
                        created: registro.themetype_created,
                        modified: registro.themetype_modified
                    }

                    var theme = {
                        themeId: registro.id,
                        title: registro.title,
                        themeType: themeType,
                        active: registro.active,
                        created: registro.created,
                        modified: registro.modified
                    }

                    updateAcervoThemes(acervo, theme);
                    conexion.resume();
                })


            /**
             * A continuación obtengo los idiomas  para un archivo
             *
             */
            var fetchLanguagesForArchive = conexion.query('select l.id, l.title, l.isocode3, l.isocode2, l.title_spanish, l.active, l.created, l.modified from languages l inner join archives_languages al on l.id = al.language_id where al.archive_id = ' + acervo.fondo.vida_record_id);

            fetchLanguagesForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var language = {
                        languageId: Number.parseInt(registro.id),
                        title: registro.title,
                        isocode3: registro.isocode3,
                        isocode2: registro.isocode2,
                        title_spanish: registro.title_spanish,
                        active: registro.active,
                        created: registro.created,
                        modified: registro.modified
                    }

                    updateAcervoLanguages(acervo, language);

                    conexion.resume();
                })


            /**
             * A continuación obtengo los materiales -fuentes del archivo digital- para un archivo
             *
             */
            var fetchMaterialsForArchive = conexion.query('select m.id, m.type_id, m.id_externo, m.formato, m.tambor, m.copias, m.actos, m.items, m.ubicacion, m.conservacion, m.observacion, m.metraje, m.numero, m.duracion, m.soporte, m.coleccion, m.titulo_formal, t.title from materials m inner join archives_materials am on m.id = am.material_id inner join types t on m.type_id = t.id  where am.archive_id = ' + acervo.fondo.vida_record_id);

            fetchMaterialsForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var materialType = {
                        materialTypeId: registro.type_id,
                        title: registro.title
                    }

                    var material = {
                        materialId: registro.id,
                        type: materialType,
                        id_externo: registro.id_externo,
                        formato: registro.formato,
                        tambor: registro.tambor,
                        copias: registro.copias,
                        actos: registro.actos,
                        items: registro.items,
                        ubicacion: registro.ubicacion,
                        conservacion: registro.conservacion,
                        observacion: registro.observacion,
                        metraje: registro.metraje,
                        numero: registro.numero,
                        duracion: registro.duracion,
                        soporte: registro.soporte,
                        coleccion: registro.coleccion,
                        titulo_formal: registro.titulo_formal
                    }

                    updateAcervoMaterial(acervo, material);
                    conexion.resume();
                })

            /**
             * A continuación obtengo los generos para un archivo
             *
             */
            var fetchGenresForArchive = conexion.query('select g.id, g.title, g.description, g.active, g.created, g.modified from genres g inner join archives_genres ag on g.id = ag.genre_id where ag.archive_id = ' + acervo.fondo.vida_record_id);

            fetchGenresForArchive
                .on('result', function(registro) {
                    conexion.pause();

                    var genre = {
                        genreId: registro.id,
                        title: registro.title,
                        description: registro.title,
                        active: registro.active,
                        created: registro.created,
                        modified: registro.modified
                    }

                    updateAcervoGenre(acervo, genre);
                    conexion.resume();
                })


            /**
             * Genero el campo stringify para cada registro Acervo                 *
             */
            // let stringifiedString = buildStringifyField(acervo);
            // updateAcervoStringify(acervo, stringifiedString).then(result => {

            // }).catch(error => {
            //     c onsole.log('[ERROR] Acervo ID: %s :: Al generar campo stringify', acervo.fondo.vida_record_id);
            // });

            conexion.resume();
        })
        .on('end', function() {
            successCallback()
        });
}

async function insertNewAcervo(acervoContent) {
    await Acervo.create(acervoContent);
}

async function updateAcervoCollection(acervo, collectionArray) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, {
        "fondo.coleccion": collectionArray
    });
}

async function updateAcervoResources(acervo, resource) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { assets: resource } });
}

async function updateAcervoDocument(acervo, document) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { documentos: document } });
}

async function updateAcervoAttachment(acervo, attachment) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { attachments: attachment } });
}

async function updateAcervoTimecode(acervo, timecode) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { timecodes: timecode } });
}

async function updateAcervoArtist(acervo, artist) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { artists: artist } });
}

async function updateAcervoThemes(acervo, theme) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { temas: theme } });
}

async function updateAcervoLanguages(acervo, language) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { languages: language } });
}

async function updateAcervoMaterial(acervo, material) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { materials: material } });
}

async function updateAcervoGenre(acervo, genre) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, { $push: { genres: genre } });
}

async function updateAcervoStringify(acervo, stringifiedString) {
    await Acervo.updateOne({ "fondo.vida_record_id": acervo.fondo.vida_record_id }, {
        stringify: stringifiedString,
        agn_log: new Date().getTime().toString()
    });
}

/**********************************
 * Métodos externos
 *
 */


exports.findByQuery = function(query, errorCallback, successCallback) {
    let queryOptions = buildQuery(query);

    console.dir(queryOptions);

    Acervo.find(queryOptions).limit(MAX_RESULTS).lean().exec(function(error, results) {

        if (error) {
            errorCallback(error);

        } else {
            let hits = results.length
            consultasAcervo.procesarConsulta(query, hits);
            successCallback(results);
        }
    });
    
}

exports.findById = function(id, errorCallback, successCallback) {
    Acervo.findById(id).lean().exec(function(error, results) {
        if (error) {
            errorCallback(error);
        } else {
            successCallback(results);
        }
    });
}








/***************************************************************/
exports.exportarResultado = function(query, req, res) {
    fetchResultado(query, req, res);
}

function fetchResultado(query, req, res) {
    const regexQuery = buildQuery(query);

    Acervo.find(regexQuery).lean().exec(function(error, results) {
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

function buildExcelStream(results, query, req, res) {
    let today = Date.now();
    let filename = 'Resultado_Busqueda_' + today + '.xlsx'

    res.writeHead(200, {
        'Content-Disposition': 'attachment; filename="' + filename + '"',
        'Transfer-Encoding': 'chunked',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    var workbook = new Excel.stream.xlsx.WorkbookWriter({ stream: res })
    var worksheet = workbook.addWorksheet('Resultado de la búsqueda')

    worksheet.addRow(['Resultado Busqueda']).commit()
    worksheet.addRow(['Fecha de emisión', new Date().toString()]).commit()
    worksheet.addRow().commit()
    worksheet.addRow(['Titulo', 'ID Externo', 'Fecha de digitalización', 'Soporte', 'Fecha grabación | filmación',
     'Sonora', 'Color', 'Duración', 'Contenido', 'Derechos', 'Observación Preparación','Observación Digitalización',
      'Nro Proc digital', 'Motivos Visuales', 'Fecha de Ingreso', 'Subtitulos', 'Tape Master Número', 'Tambor', 'Formato',
    'Copias', 'Actos', 'Ubicación', 'Conservación', 'Observacion del material', 'Productor']).commit();

    
    
    results.forEach((row, index) => {

        var color = '';
        var sonido = '';
        var tambor = '';
        var formato = '';
        var copias = '';
        var actos = '';
        var ubicacion = '';
        var conservacion = '';
        var observacion = '';
        var productor = '';
        if(row.metadatos.color !== null && row.metadatos.color !== undefined){
            color = row.metadatos.color === 1 ? "Color" : "B/N";
        }
        if(row.metadatos.sonido !== null && row.metadatos.sonido !== undefined){
            sonido = row.metadatos.sonido === 1 ? "Sonora" : "Muda";
        }

        if(row.materials && row.materials.length){
            tambor = row.materials[0].tambor;
            formato = row.materials[0].formato;
            copias = row.materials[0].copias;
            actos = row.materials[0].actos;
            ubicacion = row.materials[0].ubicacion;
            conservacion = row.materials[0].conservacion;
            observacion = row.materials[0].observacion;

        }

        if(row.artist && row.artist.length){
            productor = row.artist[0].title;
        }
        let arr = [row.metadatos.titulo_formal, (row.materials[0].id_externo || ''), row.metadatos.fecha_digitalizacion, (row.materials[0].titulo_formal || row.materials[0].type.title || ''),
        (row.metadatos.fecha_filmacion || row.metadatos.fecha_grabacion || ''),
        sonido, color, row.metadatos.duracion, row.metadatos.temas_raw, row.metadatos.derechos, row.metadatos.observacion_preparacion,
        row.metadatos.observacion_digitalizacion, row.metadatos.nroprocdigital, row.metadatos.motivos_visuales, row.metadatos.fecha_ingreso, row.metadatos.subtitulos,
        row.metadatos.tape_master_numero, tambor, formato,
         copias, actos, ubicacion,conservacion, observacion, productor
    
    
    ];

        worksheet.addRow([...arr]).commit()
    })
    
    
    
    
    
    
    
    
    
    
    
    
    
   
    

    worksheet.commit()
    workbook.commit()
}


/*************************************************************************/
/*
--- MIGRACION DE BASE DE DATOS VIDA-MYSQL A BICENTENARIO-MONGODB ----

1) Vaciar la coleccion 'acervos'
use develar_dev;
db.acervos.remove({})
2) LLamar al endpoint /api/vida/migrar
3) Regenerar el campo stringify con el endpoint /api/vida/reviewdb/stringify



--- RECREAR ÍNDICES DE TEXTO ----
1) Eliminar el índice con nombre "stringify_text"
db.acervos.dropIndex("stringify_text");
2) Recrear el índice con nombre "stringify_text" usando el campo "stringify"
db.acervos.createIndex({"stringify":"text"},{name:"stringify_text", default_language:"spanish"});

IMPORTANTE:
Si el índice de texto incluye varios campos, no es posible hacer una búsqueda
por sólo uno de dichos campos; esto es inherente al funcionamiento de MongoDB.

La línea [2] sólo usará el campo "stringify"; en caso de quererse indexar además
el título del archivo, escribir la línea:
db.acervos.createIndex({"metadata.titulo_formal":"text", "stringify":"text"},{name:"titulo_stringify_text", default_language:"spanish"});

En caso de requerir este tipo de búsqueda, es necesario recurrir a otra
herramienta más especializada (e.g. ElasticSearch)
*/