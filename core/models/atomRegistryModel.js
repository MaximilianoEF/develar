const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const atomService = require('../services/atom');
const utils = require('../services/commons.utils');

const { AtomAdapterRecord } = require('./atomAdapterModel');
const { UDARecordFactory, GestionDocRecord } = require('./unidadDescripcionModel');
const { createMinimalAuthorityRecord, AuthorityRecord } = require('./authorityRecordModel');
const { atomStatuses, gestionDocStatuses, gestionDocActions } = require('../constants');


class EstadoMigracion {
  estadoAtom = atomStatuses.ACTIVO;
  estadoGestionDoc = gestionDocStatuses.NUEVO;
  action = gestionDocActions.CREAR;
  gestionDocId = '';
  checksum;
  tsUltModifAtom;
  tsUltimoSync;

  constructor(ts, checksum) {
    this.tsUltModifAtom = ts;
    this.tsUltimoSync = ts;
    this.checksum = checksum;
  }
}

const estadoMigracionSch = new Schema({
  gestionDocId: { type: String, required: false, default: null },
  tsUltimoSync: { type: Number, required: false, default: null },
  tsUltModifAtom: { type: Number, required: false, default: null },
  checksum: { type: String, required: false, default: null },
  estadoAtom: { type: String, required: false, default: null },
  estadoGestionDoc: { type: String, required: false, default: null },
  action: { type: String, required: false, default: null },
});

const atomRegistrySch = new Schema({
  atomContent: { type: String, required: false, default: '' },
  estadoMigracion: { type: estadoMigracionSch, required: false, default: {} }
});


const Record = mongoose.model('AtomRegistry', atomRegistrySch, 'atomregistries');



/**
 * Devuelve todos los registros presentes en la colección 'atomadapters'
 * @return {*}
 */
const getAllEntitiesFromAtomAdapter = () => {
  return AtomAdapterRecord.find().lean().exec();
}




/**
 * Obtiene un registro desde AtoM, buscando según su slug
 * @param slug El slug del registro que se desea obtener
 * @return {Promise<*>}
 */
const loadRecordFromAtom = async (slug) => {
  try {
    return (await atomService.getInformationObject(slug)).json();
  } catch (error) {
    console.log('loadRecordFromAtom error: ', error);
  }
}



/**
 * Retorna una UDA de GestionDoc, lista para su grabación
 *
 * @param atomSlug El slug del registro de AtoM a partir del que se reconstruirá la UDA
 * @param atomRecord El registro de AtoM a partir del que se construirá la UDA
 * @param tsUltimaMigracion El timestamp en que se está efectuando la migración
 *
 * @borrows UDARecordFactory
 */
const UDAFactory = (atomSlug, atomRecord, tsUltimaMigracion) => {
  return UDARecordFactory(atomSlug, atomRecord);
}


/**
 * Construye y retorna un objeto AtomUdaRegistry a partir de un AtomRecord
 *
 * @param atomRecord El registro en crudo proveniente de AtoM
 * @param tsUltimaMigracion Timestamp con la fecha/hora actuales
 * @return {*}
 */
const AtomUDARegistryFactory = (atomRecord, tsUltimaMigracion) => {
  let record = {};
  const stringified = JSON.stringify(atomRecord);
  record.atomContent = stringified;

  /** Calculo el checksum a partir del contenido 'stringified' del atom-record */
  const checksum = utils.getMD5Checksum(stringified);
  record.estadoMigracion = new EstadoMigracion(tsUltimaMigracion, checksum);

  return record;
}


/**
 * Actualiza los campos necesarios para un registro AtomUdaRegistry
 *
 * @param registroAtomUdaRegistry El registro particular AtomUdaRegistry
 * @param atomRecord              El registro proveniente de AtoM
 * @param tsUltimaMigracion       Timestamp en que se está ejecutando la actualización
 * @return {Promise<boolean>}
 */
const updateAtomUdaRegistry = async (registroAtomUdaRegistry, atomRecord, tsUltimaMigracion) => {
  const stringified = JSON.stringify(atomRecord);

  /** Recalculo ambos checksums; así sabemos si después hay que actualizar el registro en GestionDoc */
  const newChecksum = utils.getMD5Checksum(stringified);
  const originalChecksum = registroAtomUdaRegistry.estadoMigracion.checksum;

  const shouldUpdateGestionDocRecord = newChecksum !== originalChecksum;

  registroAtomUdaRegistry.estadoMigracion.checksum = newChecksum;
  registroAtomUdaRegistry.atomContent = stringified;
  registroAtomUdaRegistry.estadoMigracion.tsUltimoSync = tsUltimaMigracion;

  // Revisar esto
  if (shouldUpdateGestionDocRecord) {
    registroAtomUdaRegistry.estadoMigracion.tsUltModifAtom = tsUltimaMigracion;
  }

  await Record.findByIdAndUpdate(registroAtomUdaRegistry._id, registroAtomUdaRegistry);

  return shouldUpdateGestionDocRecord;
}


/**
 * Realiza una eliminación lógica de un registro atom-adapter
 * @param atomAdapterRecord El registro atom-adapter a dar de baja
 * @param tsUltimoSync El timestamp en que se está realizando la baja
 * @return {Promise<boolean>}
 */
const removeAtomAdapter = async (atomAdapterRecord, tsUltimoSync) => {
  const shouldUpdate = atomAdapterRecord.estadoMigracion.estadoGestionDoc !== gestionDocStatuses.INACTIVO ||
    atomAdapterRecord.estadoMigracion.estadoAtom !== atomStatuses.INACTIVO ||
    atomAdapterRecord.estadoMigracion.action !== gestionDocActions.DAR_DE_BAJA;

  if (shouldUpdate) {
    atomAdapterRecord.estadoMigracion.estadoGestionDoc = gestionDocStatuses.INACTIVO;
    atomAdapterRecord.estadoMigracion.estadoAtom = atomStatuses.INACTIVO;
    atomAdapterRecord.estadoMigracion.action = gestionDocActions.DAR_DE_BAJA;

    await AtomAdapterRecord.findByIdAndUpdate(atomAdapterRecord._id, atomAdapterRecord);
  }

  return shouldUpdate;
}

/**
 * Realiza una eliminación lógica de un registro atom-uda-registry
 * @param registroAtomUdaRegistry El registro atom-uda-registry a dar de baja
 * @param tsUltimoSync El timestamp en que se está realizando la baja
 * @return {Promise<*>}
 */
const removeAtomUdaRegistry = async (registroAtomUdaRegistry, tsUltimoSync) => {
  registroAtomUdaRegistry.estadoMigracion.estadoGestionDoc = gestionDocStatuses.INACTIVO;
  registroAtomUdaRegistry.estadoMigracion.estadoAtom = atomStatuses.INACTIVO;
  registroAtomUdaRegistry.estadoMigracion.action = gestionDocActions.DAR_DE_BAJA;

  return Record.findByIdAndUpdate(registroAtomUdaRegistry._id, registroAtomUdaRegistry);
}


const removeGestionDocRecord = async (registroGestionDoc, tsUltimoSync) => {
  registroGestionDoc.estado = gestionDocStatuses.INACTIVO;
  return GestionDocRecord.findByIdAndUpdate(registroGestionDoc._id, registroGestionDoc);
}

exports.syncGestionDocWithAtom = async () => {

  console.log('SINCALL syncGestionDocWithATOM to BEGIN')
  const toReturn = [];

  /** Generar y almacenar el timestamp de inicio de la operación */
  const tsUltimaMigracion = Date.now();

  /** Diccionario para gestionar los AtomAdapters */
  const atomRecordsMap = new Map();

  /** Leer la coleccion atomadapters desde Mongo  y cargarla en el diccionario */
  const atomAdapters = await getAllEntitiesFromAtomAdapter();
  console.log('SINCALL syncGestionDocWithATOM to BEGIN [%s]', atomAdapters && atomAdapters.length);

  if (atomAdapters && atomAdapters.length) {
    atomAdapters.forEach(item => {
      atomRecordsMap.set(item.slug, { ...item, estadoMigracion: { ...item.estadoMigracion } });
    });
  }

  /** Iteramos el diccionario; la key es el slug del registro en AtoM */
  for (let [key, atomAdapterRecord] of atomRecordsMap) {
    if (atomAdapterRecord.estadoMigracion.estadoAtom !== atomStatuses.INACTIVO) {
      const atomRecord = await loadRecordFromAtom(key);
      if (atomRecord.repository) {
        const company = createMinimalAuthorityRecord(atomRecord.repository, true);
        await AuthorityRecord.findOneAndUpdate(
          { "identityArea.authorizedName": company.identityArea.authorizedName },
          {
            "$set": {
              identityArea: company.identityArea, descriptionArea: company.descriptionArea,
              controlArea: company.controlArea, isArchivalInstitution: company.isArchivalInstitution,
              isAtom: company.isAtom
            }
          },
          { upsert: true, new: true }
        ).exec();

      }
      if (atomRecord.creators && atomRecord.creators.length) {
        for (let creator of atomRecord.creators) {
          /**
           * Genero un authority-record mediante factory, con los datos que me preoporciona
           * el atom-record, que es un registro detallado de AtoM
           *
           * En general, es esperable que el authority-record ya exista en la colección, aunque de
           * manera incompleta; en este caso lo que se hará es completar el registro ya existente
           * y actualizarlo.
           */
          const authorityRecord = createMinimalAuthorityRecord(creator);

          await AuthorityRecord.findOneAndUpdate(
            { "identityArea.authorizedName": authorityRecord.identityArea.authorizedName },
            {
              "$set": {
                identityArea: authorityRecord.identityArea, descriptionArea: authorityRecord.descriptionArea,
                controlArea: authorityRecord.controlArea
              }
            },
            { upsert: true, new: true }
          ).exec();
        }
      }


      /**
       * Primero hay que determinar si el registro (o sea, atomRecord) es un registro nacido en AtoM, 
       * o bien es un registro que se importó hacia AtoM desde GestionDoc. En tal caso, va a venir la key
       * alternative_identifiers, contenido un objeto con la forma 
       * {
       *  "label": "gestiondoc",
       *  "identifier": "619fd22941cbe910804ba9f8"
       * }
       */
     
      let esRegistroNacidoEnGdoc = false;
      
      if (atomRecord.alternative_identifiers && atomRecord.alternative_identifiers.length > 0) {
        // esRegistroNacidoEnGdoc = atomRecord.alternative_identifiers.some(identifier => identifier.label === 'gestiondoc');
        esRegistroNacidoEnGdoc = atomRecord.alternative_identifiers.find(identifier => identifier.label === 'gestiondoc');
      }


      /** Caso ALTA */
      if (atomAdapterRecord.estadoMigracion.action === gestionDocActions.CREAR) {
        /** Registro en GestionDoc */
        let registroGestionDoc;
        if (!esRegistroNacidoEnGdoc) {
          registroGestionDoc = await GestionDocRecord.create(UDAFactory(atomAdapterRecord.slug, atomRecord, tsUltimaMigracion));
        } else {
          registroGestionDoc = await GestionDocRecord.findById(esRegistroNacidoEnGdoc.identifier);
        }

        /** Registro en AtomRegistries */
        const registroAtomRegistry = await Record.create(AtomUDARegistryFactory(atomRecord, tsUltimaMigracion));

        /** Actualización de campos en el registro AtomAdapter correspondiente al registro que se migró */
        atomAdapterRecord.estadoMigracion.gestionDocId = registroGestionDoc._id;
        atomAdapterRecord.estadoMigracion.udaRegistryId = registroAtomRegistry._id;
        atomAdapterRecord.estadoMigracion.estadoGestionDoc = gestionDocStatuses.ACTIVO;
        atomAdapterRecord.estadoMigracion.action = gestionDocActions.MIGRADO;

        await AtomAdapterRecord.findByIdAndUpdate(atomAdapterRecord._id, atomAdapterRecord);

      } else if (atomAdapterRecord.estadoMigracion.estadoGestionDoc !== gestionDocStatuses.NUEVO) {
        /**
         * Caso MODIFICACIÓN: sólo chequear por estadoGestionDoc !== ESTADO_GDOC_NUEVO
         *  pues se ha preguntado antes si estadoAtom !== ESTADO_ATOM_INACTIVO
         */


        const registroAtomUdaRegistry = await Record.findById(atomAdapterRecord.estadoMigracion.udaRegistryId);

        const status = await updateAtomUdaRegistry(registroAtomUdaRegistry, atomRecord, tsUltimaMigracion);

        if (status) {
          await GestionDocRecord.findByIdAndUpdate(atomAdapterRecord.estadoMigracion.gestionDocId, UDAFactory(atomAdapterRecord.slug, atomRecord, tsUltimaMigracion));
        }

        atomAdapterRecord.estadoMigracion.estadoGestionDoc = gestionDocStatuses.ACTIVO;
        atomAdapterRecord.estadoMigracion.action = gestionDocActions.MIGRADO;

        await AtomAdapterRecord.findByIdAndUpdate(atomAdapterRecord._id, atomAdapterRecord);
      }
    } else {
      /** Registro AtomAdapter inactivo; caso BAJA */
      const status = await removeAtomAdapter(atomAdapterRecord, tsUltimaMigracion);

      if (status) {
        const registroAtomUdaRegistry = await Record.findById(atomAdapterRecord.estadoMigracion.udaRegistryId);
        await removeAtomUdaRegistry(registroAtomUdaRegistry, tsUltimaMigracion);

        const registroGestionDoc = await GestionDocRecord.findById(atomAdapterRecord.estadoMigracion.gestionDocId);
        await removeGestionDocRecord(registroGestionDoc, tsUltimaMigracion);
      }
    }
  }

  return toReturn;
}


