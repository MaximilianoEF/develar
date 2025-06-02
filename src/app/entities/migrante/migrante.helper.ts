import { devutils } from "../../develar-commons/utils";
import { MigranteTable, Migrante, MigranteQuery, MigranteAntecedenteData } from "./migrante.model";

const defaultOptionList = [
  { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];


const optionsLists = {
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

const MIGRACIONES: string = 'migraciones';
export class MigranteHelper {

  static cleanQueryToken(query: MigranteQuery): MigranteQuery {
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

  static buildMigrantesDataTable(items: Migrante[]): MigranteTable[] {
    return items.map(item => {
      const tableCell = new MigranteTable();
      tableCell.barco = item.barconombre;
      tableCell.embarque = item.embarque;
      tableCell.fechaevento = devutils.txFromDateTime(item.fechaevento_ts);
      tableCell.fechaevento_ts = item.fechaevento_ts;
      tableCell.nomyape = item.nombre+' '+item.apellido;
      tableCell.nacionalidad = item.nacionalidad;
      tableCell.edad = item.edadanios;
      tableCell.nombre = item.nombre;
      tableCell.apellido = item.apellido;
      tableCell.observaciones = `${item.nrolista && item.nrolista !== 'NULL' ? item.nrolista : ''}  ${item.nroorden &&  item.nroorden !== 'NULL' ? item.nroorden : ''}`;
      tableCell.detailRow = true;
      tableCell.source = item;
      return tableCell;
    })
  }

  static buildMigranteAntecedenteData(item: any): MigranteAntecedenteData {
      const token = new MigranteAntecedenteData();
      token._id = item._id;
      if(item.identificador) {
        token.isUD = true;
        /** Es una UDA */
        token.title = item.identificador.title;
        token.identifier = item.identificador.identifier;
        if(item.identificador.dates && item.identificador.dates.length) {
          const date = item.identificador.dates.find(f => f.type === MIGRACIONES);
          if(date) {
            token.feDesdeHasta = `${date.start_date} a ${date.end_date}`;
            token.feDesdeTs = date.start_date_ts;
            token.feHastaTs = date.end_date_ts;
          }
        }
        if(item.audit) {
          token.inventario = item.audit.inventario;
        }

        if(item.assets && item.assets.length) {
          token.assetId = item.assets[0].entityId;
        }
      } else {
        token.isUD = false;
        /** Es un libro */
        token.title = item.titulo;
        token.identifier = `Todavía no ha sido ingestado.`;
        token.feDesdeHasta = `${item.fedesde} a ${item.fehasta}`;
        token.feDesdeTs = item.fedesde_ts;
        token.feHastaTs = item.fehasta_ts;
        token.inventario = item.libroid;
      }

      return token;
  }
}