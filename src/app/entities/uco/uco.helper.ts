import { Uco, UcoQuery, UcoTableData } from './uco.model';

const defaultOptionList = [
    { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];



const optionsLists = {
    default: defaultOptionList
};

function getLabel(list, val) {
    const t = list.find((item) => item.val === val);
    return t ? t.label : val;
}

export class UcoHelper {


    static cleanQueryToken(
      query: UcoQuery
    ): UcoQuery {
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

    static buildUcoTableData(data : Uco[]) : UcoTableData[] {
      return data.map(token => {
        let item = new UcoTableData();
        item.slug = token.slug;
        item.cod_uco = token.cod_uco;
        item._id = token._id;
        return item;
      })
    }

    
}
