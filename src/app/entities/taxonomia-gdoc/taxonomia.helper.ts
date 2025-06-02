import { Taxonomia, TaxonomiaQuery, TaxonomiaTable, TaxonomiaTermino, TaxonomiaTerminoTable } from "./taxonomia.model";

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

export class TaxonomiaHelper {
  static cleanQueryToken(query: TaxonomiaQuery): TaxonomiaQuery {
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

  static buildTaxonomiaDataTable(taxonomiasCabeceras: Taxonomia[]): TaxonomiaTable[] {
    return taxonomiasCabeceras.map(token => {
      const tableCell = new TaxonomiaTable;

      tableCell.identificador = token.identificador;

      tableCell.source = token;
      tableCell.descripcion = token.descripcion;

      return tableCell;
    })
  }

  static buildTaxonomiaTerminoDataTable(taxonomiasTerminos: TaxonomiaTermino[]): TaxonomiaTerminoTable[] {
    return taxonomiasTerminos.map(token => {
      const tableCell = new TaxonomiaTerminoTable();

      tableCell._id = token._id;
      tableCell.identificador = token.identificador;
      tableCell.source = token;
      tableCell.slug = token.slug;
      tableCell.descripcion = token.descripcion;
      tableCell.taxonomiaId = token.taxonomiaId;
      tableCell.isLocked = token.isLocked;

      return tableCell;
    })
  }

  static buildTermino(fvalueTermino: any, entity: Taxonomia, sinonimos: string[]): TaxonomiaTermino {

      fvalueTermino.cabeceraId = entity._id;
      fvalueTermino.cabeceraIdentificador = entity.identificador;
      fvalueTermino.sinonimos = sinonimos;
      return new TaxonomiaTermino(fvalueTermino);
  }
}
