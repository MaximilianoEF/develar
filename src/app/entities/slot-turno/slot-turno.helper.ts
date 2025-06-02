import { SlotTurnoQuery, SlotTurno, SlotTurnoTable, SlotTurnoTemplate } from './slot-turno.model';

const dowOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 0, label: 'Domingo', slug: 'Domingo' },
  { val: 1, label: 'Lunes', slug: 'Lunes' },
  { val: 2, label: 'Martes', slug: 'Martes' },
  { val: 3, label: 'Miércoles', slug: 'Miércoles' },
  { val: 4, label: 'Jueves', slug: 'Jueves' },
  { val: 5, label: 'Viernes', slug: 'Viernes' },
  { val: 6, label: 'Sábado', slug: 'Sábado' }
];

const estadoTurnoSedeOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 'activo', label: 'Activo', slug: 'Activo' },
  { val: 'inactivo', label: 'Inactivo', slug: 'Inactivo' }
];

const sedesOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 'rondeau', label: 'Sede Parque Patricios', slug: 'rondeau', address: 'Rondeau 2277, Ciudad Autónoma de Buenos Aires', estado : 'activo', tiposConsulta: ['documental', 'fotografia', 'filmico', 'sonoro'] },
  { val: 'alem', label: 'Sede San Nicolas', slug: 'alem', address: 'Av. Leandro N. Alem 246, Ciudad Autónoma de Buenos Aires', estado : 'inactivo', tiposConsulta: ['filmico', 'sonoro'] },
  { val: 'santelmo', label: 'Sede San Telmo', slug: 'santelmo', address: 'Av Paseo Colón 1093, Ciudad Autónoma de Buenos Aires', estado : 'activo', tiposConsulta: ['documental', 'fotografia'] },
];

const tipoTurneraOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 'auditorio', label: 'Auditorio', slug: 'Auditorio' },
  { val: 'consultasacervo', label: 'Consulta de acervo', slug: 'Consulta de acervo' },
  { val: 'tramites', label: 'Trámites', slug: 'Trámites' },
  { val: 'biblioteca', label: 'Biblioteca', slug: 'Biblioteca' },
  { val: 'administracion', label: 'Administración', slug: 'Administración' },
];

const defaultOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' }
];

const optionsLists = {
  default: defaultOptList,
  dow: dowOptList,
  estado: estadoTurnoSedeOptList,
  sede: sedesOptList,
  tipoTurnera: tipoTurneraOptList
};


function getLabel(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.label : val;
}

export class SlotTurnoHelper {
  static cleanQueryToken(query: SlotTurnoQuery): SlotTurnoQuery {
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

  static buildTurnoSedeDataTable(itemList: SlotTurnoTemplate[]): SlotTurnoTable[] {
    return itemList.map((token) => {
      const tableCell = new SlotTurnoTable();

      tableCell._id = token._id;
      tableCell.nombre = token.nombreturno;
      tableCell.sede = SlotTurnoHelper.getOptionLabel('sede', token.sede);
      tableCell.estado = SlotTurnoHelper.getOptionLabel('estado', token.estado);
      tableCell.slug = token.description;
      tableCell.type = SlotTurnoHelper.getOptionLabel('tipoTurnera', token.type);

      return tableCell;
    });
  }
}
