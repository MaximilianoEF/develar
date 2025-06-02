const atomStatuses = Object.freeze({
  ACTIVO: 'activo',
  INACTIVO: 'inactivo'
});

const gestionDocStatuses = Object.freeze({
  NUEVO: 'nuevo',
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
});

const gestionDocActions = Object.freeze({
  CREAR: 'crear en gestionDoc',
  ACTUALIZAR: 'actualizar en gestionDoc',
  MIGRADO: 'migrado', // Revisar esto; tendría que ser un verbo; consultar a Mateo
  DAR_DE_BAJA: 'dar de baja en gestionDoc'
});


// Hostname a utilizar en el campo digitalObjectURI durante la migración de GDoc a AtoM
const digitalObjectURIHostname = 'http://gestiondoc:8080';

exports.atomStatuses = atomStatuses;
exports.gestionDocStatuses = gestionDocStatuses;
exports.gestionDocActions = gestionDocActions;
exports.digitalObjectURIHostname = digitalObjectURIHostname;