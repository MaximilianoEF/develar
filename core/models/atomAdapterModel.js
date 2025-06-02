const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const atomService = require('../services/atom');
const crypto = require('crypto');
const { AuthorityRecord, createMinimalAuthorityRecord } = require('./authorityRecordModel');

const offset = 10;

/** Estados por los que transiciona un registro en atomadapters */
const ESTADO_ATOM_ACTIVO = 'activo';
const ESTADO_ATOM_INACTIVO = 'inactivo';

const ESTADO_GDOC_NUEVO = 'nuevo';
const ESTADO_GDOC_ACTIVO = 'activo';
const ESTADO_GDOC_INACTIVO = 'inactivo';
const ACCION_GDOC_CREAR = 'crear en gestionDoc';
const ACCION_GDOC_ACTUALIZAR = 'actualizar en gestionDoc';
const ACCION_GDOC_MIGRADO = 'migrado'; // Revisar esto; tendría que ser un verbo
const ACCION_GDOC_DARDEBAJA = 'dar de baja en gestionDoc';


class EstadoMigracion {
  estadoAtom = ESTADO_ATOM_ACTIVO;
  estadoGestionDoc = ESTADO_GDOC_NUEVO;
  action = ACCION_GDOC_CREAR;
  gestionDocId = '';
  udaRegistryId = '';
  checksum;
  tsUltModifAtom;
  tsUltimoSync;
    constructor(ts, checksum){
      this.tsUltModifAtom = ts;
      this.tsUltimoSync = ts;
      this.checksum = checksum;
    }
}

const estadoMigracionSch = new Schema({
  gestionDocId:               { type: String,          required: false, default: null },
  udaRegistryId:              { type: String,          required: false, default: null },
  tsUltimoSync:               { type: Number,          required: false, default: null },
  tsUltModifAtom:             { type: Number,          required: false, default: null },
  checksum:                   { type: String,          required: false, default: null },
  estadoAtom:                 { type: String,          required: false, default: null },
  estadoGestionDoc:           { type: String,          required: false, default: null },
  action:                     { type: String,          required: false, default: null },
})

const atomAdapterSch = new Schema({
  reference_code:             { type: String,             required: false, default: '' },
  slug:                       { type: String,             required: false, default: '' },
  title:                      { type: String,             required: false, default: '' },
  physical_characteristics:   { type: String,             required: false, default: '' },
  repository:                 { type: String,             required: false, default: '' },
  level_of_description:       { type: String,             required: false, default: '' },
  creators:                   { type: [String],           required: false, default: [] },
  creation_dates:             { type: [String],           required: false, default: [] },
  estadoMigracion:            { type: estadoMigracionSch, required: false, default: {} },
})

const Record = mongoose.model('AtomAdapter', atomAdapterSch, 'atomadapters');

exports.AtomAdapterRecord = Record;

exports.syncAll = async () => {
  console.log('SINCALL atomAdapterModel to BEGIN')
  /** Creamos la estructura map para gestionar los AtomAdapters */
  const atomRecordsMap = new Map();
  const authorityRecordsMap = new Map();

  /** Leer la coleccion atomadapters desde Mongo */
  const atomAdapters = await getAllEntitiesAtomAdapter();
  /** Estado con el que vamos a setear, en primera medida, a los registros devueltos de AtomAdapter */
  const estadoAtom = ESTADO_ATOM_INACTIVO;
  if(atomAdapters && atomAdapters.length){
    atomAdapters.forEach( item => {
      atomRecordsMap.set(item.slug, {...item, estadoMigracion: {...item.estadoMigracion, estadoAtom} });
    })
  }

  await loadRecordsFromAtom(atomRecordsMap, authorityRecordsMap);

  /** Vaciado de la colección atomadapters */
  await Record.deleteMany({});
  /** Vaciado de la colección authorityRecords */
  await AuthorityRecord.deleteMany({});

  const arEntries = Object.fromEntries(authorityRecordsMap);
  const arEntities = [];
  for(let k of Object.keys(arEntries)) {
    arEntities.push(arEntries[k]);
  }

  AuthorityRecord.insertMany(arEntities);


  const entries = Object.fromEntries(atomRecordsMap);
  const entities = [];
  for(let k of Object.keys(entries)) {
    entities.push(entries[k]);
  }
  console.log('=========================================')
  console.log('AtomAdapter to INSERT MANY: [%s]', entities  && entities.length);
  console.log('=========================================')
  return Record.insertMany(entities);
}


const loadRecordsFromAtom = async (map, authorityRecordsMap) => {
  const tsUltimaModif = Date.now();

  let hasResults = true;
  let i = 0;

  while(hasResults) {
    const atomRecords = await (await atomService.getInformationObjectsSkip(i)).json();
    hasResults = atomRecords.results && atomRecords.results.length > 0;

    if (hasResults) await initProcessSyncAll(atomRecords.results, map, authorityRecordsMap, tsUltimaModif);

    i += offset;
  }
}

const getAllEntitiesAtomAdapter = () => {
  return Record.find().lean().exec();
}

const initProcessSyncAll = async (atomRecords, map, authorityRecordsMap, tsUltimaModif) => {
  for(let k = 0; k < atomRecords.length; k++) {

    /** Miro el array de creators */
    if (atomRecords[k].creators && atomRecords[k].creators.length > 0) {
      for(let i = 0; i < atomRecords[k].creators.length; i++) {
        if (!authorityRecordsMap.has(atomRecords[k].creators[i])) {
          const authorityRecord = createMinimalAuthorityRecord(atomRecords[k].creators[i]);
          authorityRecordsMap.set(atomRecords[k].creators[i], authorityRecord);
        }
      }
    }

    /** Este checksum es el del resultado FRESCO que viene de AtoM */
    const hash = crypto.createHash('md5');
    const atomChecksum = hash.update(JSON.stringify(atomRecords[k]), 'utf8').digest('hex');

    if(map.has(atomRecords[k].slug)){
      let previousRecord = map.get(atomRecords[k].slug);
      /**
       * Si la entidad existe, comparamos los checksums; si son distintos, quiere decir que algo cambió en AtoM
       * y deberíamos refrescar la UDA en GestionDoc; además se actualiza el timestamp para el registro
       * en particular
       */
      if (previousRecord.estadoMigracion.checksum !== atomChecksum) {
        Object.assign(previousRecord, atomRecords[k]);

        if (previousRecord.estadoMigracion.estadoGestionDoc !== ESTADO_GDOC_NUEVO) {
          previousRecord.estadoMigracion.action = ACCION_GDOC_ACTUALIZAR;
        }
      }

      previousRecord.estadoMigracion.tsUltimoSync = tsUltimaModif;
      previousRecord.estadoMigracion.estadoAtom = ESTADO_ATOM_ACTIVO;

    }else{
      /**  No existe el registro
       *   por ende, hay que crearlo
       */
      const estadoMigracion = new EstadoMigracion(tsUltimaModif, atomChecksum);
      const atomRecord = {...atomRecords[k], estadoMigracion};
      map.set(atomRecord.slug, atomRecord);
    }

  }

  return map;
}


