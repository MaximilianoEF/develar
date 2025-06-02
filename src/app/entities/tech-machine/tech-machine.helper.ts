import { TechMachine, TechMachineQuery, TechMachineTable } from './tech-machine.model';


const defaultOptionList = [
    { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];

const typeDigitalizacionesList = [
    { val: 'no_definido', label : 'no_definido'},
    { val: 'documentos',  label : 'Documentos'},
    { val: 'microfilms',  label : 'Microfilms'},
    { val: 'fotos'      , label : 'Fotografías'},
    { val: 'libros'     , label : 'Libros'}
]


const optionsLists = {
    default: defaultOptionList,
    typeDigitalizaciones : typeDigitalizacionesList
};

function getLabel(list, val) {
    const t = list.find((item) => item.val === val);
    return t ? t.label : val;
}

export class TechMachineHelper {


    static cleanQueryToken(
      query: TechMachineQuery
    ): TechMachineQuery {
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

    static buildDataTableMT(data : TechMachine[]) : TechMachineTable[] {
      return data.map(token => {
        let item = new TechMachineTable();
        item.cod_machine = token.cod_machine;
        item.fe_incorporacion_ts = token.fe_incorporacion_ts;
        item.fe_incorporacion_tx = token.fe_incorporacion_tx;
        item.marca_modelo = token.marca ? token.marca : '';
        item.marca_modelo += token.modelo ? '('+token.modelo+')' : '';
        item.slug = token.slug;
        item._id = token._id
        return item;
      })
    }

    
}
