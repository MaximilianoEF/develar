import { formatDate } from '@angular/common';
import { TurnoTable } from './models/turno.model';
import { BusquedaTable } from './models/historial.model';
import { TurnoHelper } from '../entities/turnos/turno.helper';
import { Turno } from '../entities/turnos/turno.model';
export class PreguntaSecreta {
  key: string;
  label: string;
}

const preguntasSecretas: PreguntaSecreta[] = [{
  key: 'mascota',
  label: '¿Nombre de tu mascota?',
}, {
  key: 'madre',
  label: '¿Primer nombre de tu madre?',
}, {
  key: 'hijo',
  label: '¿Primer nombre de tu hijo?',
}, {
  key: 'color',
  label: '¿Color favorito?',
}, {
  key: 'comida',
  label: '¿Comida favorita?',
}];

const turneraTableActionsList = [
  { val: 'no_definido', label: 'Elija una opción', slug: 'Elija una opción ' },
  { val: 'editone', label: 'Editar registro', slug: 'editone' },
  { val: 'reset', label: 'Limpiar selección', slug: 'reset' }
];

const sedesList = [
  { val: 'paseocolon', label: 'Sede Paseo Colón', slug: 'paseocolon' },
  { val: 'rondeau', label: 'Sede Rondeau', slug: 'rondeau' },
  // { val: 'rondeautramites', label: 'Sede Rondeau -- Trámites', slug: 'rondeautramites' },
  // { val: 'paseocolontramites', label: 'Sede Paseo Colón -- Trámites', slug: 'paseocolontramites' }
];

const tipoConsultaList = [
  { val: 'documental', label: 'Documental', slug: 'documental', sede: 'rondeau' },
  { val: 'fotografia', label: 'Fotografía', slug: 'fotografia', sede: 'rondeau' },
  { val: 'filmico', label: 'Fílmico', slug: 'filmico', sede: 'rondeau' },
  { val: 'sonoro', label: 'Sonoro', slug: 'sonoro', sede: 'rondeau' },
  // { val: 'tramitespaseocolon', label: 'Trámites Paseo colón', slug: 'tramitespaseocolon', sede: 'paseocolontramites' },
  { val: 'tramitesrondeau', label: 'Trámites Rondeau', slug: 'tramitesrondeau', sede: 'rondeautramites' },
  { val: 'biblioteca', label: 'Biblioteca', slug: 'biblioteca', sede: 'rondeautramites' }
];

const turnoEstadosList = [
  { val: 'activo', label: 'Activo', slug: 'vigente' },
  { val: 'cancelado', label: 'Cancelado', slug: 'cancelado' },
];

const default_option_list: Array<any> = [
  { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];

const turnoAvanceList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido' },
  { val: 'pendiente', label: 'Pendiente', slug: 'pendiente' },
  { val: 'noconfirmado', label: 'No confirmado', slug: 'reprogramado' },
  { val: 'ausente', label: 'Ausente', slug: 'ausente' },
  { val: 'reprogramado', label: 'Reprogramado', slug: 'reprogramado' },
  { val: 'cancelado', label: 'Cancelado', slug: 'cancelado' },


]

const tmaterialList = [
  { val: 'audiovisual', label: 'Audiovisual y sonoro'},
  { val: 'fotografica', label: 'Fotográfica'},
  { val: 'escrita',     label: 'Escrita'}
]

const optionsLists = {
  default: default_option_list,
  sede: sedesList,
  tipoConsulta: tipoConsultaList,
  estado: turnoEstadosList,
  avance: turnoAvanceList,
  tmaterial : tmaterialList
};

function getLabel(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.label : val;
}

function getOptListToken(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t : null;
}

export class AGNHelper {
  static getOptionList(type) {
    return optionsLists[type] || optionsLists['default'];
  }

  static getOptionLabelFromList(list, val) {
    if (!val) { return 'no_definido'; }
    return getLabel(list, val);
  }

  static getOptionLabel(type, val) {
    if (!val) { return 'no_definido'; }
    if (!type) { return val; }
    return getLabel(this.getOptionList(type), val);
  }

  static getPreguntasSecretasOptList(): PreguntaSecreta[] {
    return preguntasSecretas;
  }

  static getTurneraTableActionsList() {
    return turneraTableActionsList;
  }

  static getSedesList() {
    return sedesList;
  }

  static getTipoConsultaList() {
    return tipoConsultaList;
  }

  static getTurnoEstadosList() {
    return turnoEstadosList;
  }

  static buildTurneraBrowseDataTable(itemList: Turno[]): TurnoTable[] {

    return itemList.map(token => {
      const tableCell = new TurnoTable();


      tableCell._id = token._id;
      tableCell.txFechaHora = token.txFecha + ' ' + token.txHora;
      tableCell.estado = TurnoHelper.getOptionLabel('estado', token.estado);

      const sede = TurnoHelper.getOptionToken('sede', token.sede);
      const sedeNombre = sede.label;
      const sedeAddr = sede.address;

      // tableCell.sede = TurnoHelper.getOptionLabel('sede', token.sede);
      tableCell.sede = sedeNombre + ' (' + sedeAddr + ')';
      tableCell.sala = token.sala;

      tableCell.tipoConsulta = TurnoHelper.getOptionLabel('tipoConsulta', token.tipoConsulta);
      tableCell.detalle = token.detalle;

      if(token.pases && token.pases.length){
        tableCell.avance = token.pases[token.pases.length-1].novedadTx;
      }else {
        tableCell.avance = 'noconfirmado';
      }

      return tableCell;
    });
  }


}
