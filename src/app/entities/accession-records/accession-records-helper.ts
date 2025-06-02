import { devutils } from '../../develar-commons/utils';
import { User } from '../user/user';
import { AccessionRecord, AccessionRecordQuery, AccessionRecordTable, AuditAR, UnidadDescripcionProxy } from './accession-records-model';
import { DatesUD, UnidadDescripcion } from '../unidad-descripcion/unidad-descripcion.model';

const BAJA: string = 'baja';
const INACTIVO: string = 'inactivo';
const ACTIVO: string = 'activo';

const headerActionsList = [
  // { val: 'lugar',       label: 'Lugar'},
  // { val: 'nombre',      label: 'Nombre'},
  { val: 'migrante', label: 'Migrantes'},
  { val: 'barcovapores', label: 'Barco / Vapores'}
];

const typeFechaList = [
  { val: 'arribovapor', label: 'Arribo vapor'},
  { val: 'isEgreso',  label: 'Egreso' }
]
const defaultOptionList = [
  { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];


const optionsLists = {
  headerActions : headerActionsList,
  typeFecha : typeFechaList,
  default: defaultOptionList,
};


function getLabel(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.label : val;
}

function getSlug(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.slug : val;
}


export class AccessionRecordsHelper {

  static cleanQueryToken(query: AccessionRecordQuery): AccessionRecordQuery {
    if (!query) {
      return null;
    }

    Object.keys(query).forEach((key) => {
      if (
        query[key] == null ||
        query[key] === '' ||
        query[key] === 'no_definido'
      ) {
        delete query[key];
      }
    });

    return query;
  }

  static getOptionList(type) {
    return optionsLists[type] || optionsLists['default'];
  }

  static getOptionLabel(type, val) {
    if (!val) {
      return 'no_definido';
    }
    if (!type) {
      return val;
    }
    return getLabel(this.getOptionList(type), val);
  }

  static getOptionSlug(type, val) {
    if (!val) {
      return 'no_definido';
    }
    if (!type) {
      return val;
    }
    return getSlug(this.getOptionList(type), val);
  }

/**
 * Construye el modelo de datos pertinente a la vista de tabla de los AccessionRecords
 * @param {Array<AccesionRecord>} itemList
 * @returns {AccessionRecordTable}
 */
  static buildAccessionRecordsDataTable(itemList: AccessionRecord[]): AccessionRecordTable[] {
    return itemList.map((token) => {
     return this.buildAccessionRecordDataTableWithAR(token);
    });
  }

  static buildAccessionRecordDataTableWithAR(token: AccessionRecord): AccessionRecordTable {
    
      const tableCell = new AccessionRecordTable();
      tableCell._id = token._id;

      if (token.migrante) {
        tableCell.barco = token.migrante.barco;
        tableCell.nomyape = `${token.migrante.nombre} ${token.migrante.apellido}`;
        tableCell.date_type = token.migrante.date_type;
        tableCell.fe_migracion_ts = token.migrante.fe_migracion_ts ? token.migrante.fe_migracion_ts : 0;
        tableCell.fe_migracion_tx = token.migrante.fe_migracion_tx ? token.migrante.fe_migracion_tx : 'Desconocido';
        tableCell.fe_nacimiento_ts = token.migrante.fe_nacimiento_ts ? token.migrante.fe_nacimiento_ts : 0;
        tableCell.fe_nacimiento_tx = token.migrante.fe_nacimiento_tx ? token.migrante.fe_nacimiento_tx : 'Desconocido';
        tableCell.observaciones = token.migrante.observaciones;
      }

      tableCell.idUda = token.uda ? token.uda.idUda : '';

      tableCell.idAR = token.idAR;
      tableCell.assetId = token.uda && token.uda.assetId ? token.uda.assetId : '';

      tableCell.source = token;

      return tableCell;
    
  }

  static buildAuditAR(action: string, user: User): AuditAR {
    const audit = new AuditAR();
    const today = Date.now();

    audit.estado = action === BAJA ? INACTIVO : ACTIVO;
    audit.fe_alta_ts = today;
    audit.fe_alta_tx = devutils.txFromDateTime(today);
    audit.userId = user ? user._id : 'no_definido';
    audit.username = user ? user.username : 'no_definido';

    return audit;
  }

  static buildUdaProxy(uda: UnidadDescripcion): UnidadDescripcionProxy {
    const udaProxy = new UnidadDescripcionProxy();

    if (uda) {
      udaProxy.atomSlug = uda.atomSlug;

      if(uda.identificador) {
        udaProxy.reference_code = uda.identificador.reference_code;
        udaProxy.title = uda.identificador.title;
      }
      
      udaProxy.idUda = uda._id;

      if (uda.assets && uda.assets.length > 0) {
        udaProxy.assetId = uda.assets[0].entityId;
      } else {
        udaProxy.assetId = null;
      }
    }
    
    return udaProxy;
  }

  static buildDateFromARDate(ar: AccessionRecord): DatesUD {
    const date = new DatesUD();

    if(ar.migrante){
      date.type = ar.migrante.date_type;
      date.date = ar.migrante.fe_migracion_tx;
      date.end_date = ar.migrante.fe_migracion_tx;
      date.end_date_ts = ar.migrante.fe_migracion_ts;
      date.start_date = ar.migrante.fe_migracion_tx;
      date.start_date_ts = ar.migrante.fe_migracion_ts;
    }
    return date;
  }
}

