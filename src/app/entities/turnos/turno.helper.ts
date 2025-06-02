import { formatDate } from '@angular/common';
import { Turno, TurnoTable, TurnoQuery } from './turno.model';
import { devutils } from '../../develar-commons/utils';
import { Atendido, Pase } from '../consultas/consulta.model';
import { User } from '../user/user';

const sedesList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido', address: 'no_definido' },
  // { val: 'paseocolon', label: 'Sede Paseo Colón', slug: 'paseocolon' },
  { val: 'rondeau', label: 'Sede Parque Patricios', slug: 'rondeau', address: 'Rondeau 2277, Ciudad Autónoma de Buenos Aires', estado : 'activo', tiposConsulta: ['documental','fotografia','filmico','sonoro'] },
  { val: 'alem', label: 'Sede San Nicolas', slug: 'alem', address: 'Av. Leandro N. Alem 246, Ciudad Autónoma de Buenos Aires', estado : 'inactivo', tiposConsulta: ['filmico','sonoro'] },
  { val: 'santelmo', label: 'Sede San Telmo', slug: 'santelmo', address: 'Av Paseo Colón 1093, Ciudad Autónoma de Buenos Aires', estado : 'activo', tiposConsulta: ['documental','fotografia'] },

  // { val: 'rondeautramites', label: 'Sede Rondeau -- Trámites', slug: 'rondeautramites' },
  // { val: 'paseocolontramites', label: 'Sede Paseo Colón -- Trámites', slug: 'paseocolontramites' }
];
const tipoConsultaList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido' },
  { val: 'documental', label: 'Documental', slug: 'documental', sede: 'rondeau' },
  { val: 'fotografia', label: 'Fotografía', slug: 'fotografia', sede: 'rondeau' },
  { val: 'filmico', label: 'Fílmico', slug: 'filmico', sede: 'rondeau' },
  { val: 'sonoro', label: 'Sonoro', slug: 'sonoro' , sede: 'rondeau' },
  // { val: 'tramit```espaseocolon', label: 'Trámites Paseo Colón', slug: 'tramitescolon', sede: 'paseocolontramites' },
  { val: 'tramitesrondeau', label: 'Trámites Rondeau', slug: 'tramitesrondeau', sede: 'rondeau' },
  { val: 'biblioteca', label: 'Biblioteca', slug: 'biblioteca', sede: 'santelmo' }
];


const ESTADO_END : string = 'cerrado';
const turnoEstadosList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido' },
  { val: 'activo',      label: 'Activo',    slug: 'activo' },
  { val: 'pendiente',   label: 'Pendiente', slug: 'pendiente' },
  { val: 'cerrado',     label: 'Cerrado',   slug: 'cerrado' },
];

const turnoAvanceList = [
  { val: 'no_definido',      label: 'Sin selección',             slug: 'no_definido' },
  { val: 'confirmado',       label: 'Confirmado por AGN',        slug: 'confirmado',             isCumplida: false, estado: 'activo'},
  { val: 'aconfirmar',       label: 'Turno pendiente de validación por AGN', slug: 'aconfirmar', isCumplida: false, estado: 'pendiente' },
  { val: 'creadoagn',        label: 'Creado por AGN',            slug: 'confirmado',             isCumplida: false, estado: 'activo'},
  { val: 'edicionusuario',   label: 'Fecha de turno modificada', slug: 'edicionusuario',         isCumplida: false, estado: 'activo'},
  { val: 'edicionagn',       label: 'Turno modificado por AGN',  slug: 'edicionagn',             isCumplida: false, estado: 'activo'},
  { val: 'perfeccionado',    label: 'Perfeccionado',             slug: 'perfeccionado',          isCumplida: false, estado: 'activo' },
  { val: 'cumplido',         label: 'Cumplido',                  slug: 'cumplido',               isCumplida: true,  estado: 'cerrado'},
  { val: 'incumplido',       label: 'Turno incumplido',          slug: 'incumplido',             isCumplida: false, estado: 'cerrado'},
  { val: 'canceladoagn',     label: 'Cancelado por AGN',         slug: 'canceladoagn',           isCumplida: false, estado: 'cerrado'},
  { val: 'canceladousuario', label: 'Cancelado por Usuario',     slug: 'canceladousuario',       isCumplida: false, estado: 'cerrado'},
]

const default_option_list: Array<any> = [
  { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];

const optionsLists = {
  default: default_option_list,
  sede: sedesList,
  tipoConsulta: tipoConsultaList,
  estado: turnoEstadosList,
  avance: turnoAvanceList
};

function getLabel(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.label : val;
}

function getOptListToken(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t : null;
}

function getEstado(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.estado : val;
}

function transicionAvance(oldState: string, isUserWeb: boolean, action?: string){
  if(action){
    if(action === "cancelar"){
      return isUserWeb ? getOptListToken(turnoAvanceList, 'canceladousuario') : getOptListToken(turnoAvanceList, 'canceladoagn')
    }

    if(action === 'crear'){
      // Nuevo turno.  Avances posible: aconfirmar | creadoagn
      return isUserWeb ? getOptListToken(turnoAvanceList, 'aconfirmar') : getOptListToken(turnoAvanceList, 'creadoagn')
    }

    if(action === 'editar'){
      if(isUserWeb && oldState === "aconfirmar"){
        return  getOptListToken(turnoAvanceList, 'aconfirmar')
      }
      return isUserWeb ? getOptListToken(turnoAvanceList, 'edicionusuario') : getOptListToken(turnoAvanceList, 'edicionagn')
    }

    // el nuevo estado de avance lo decide el caller
    return getOptListToken(turnoAvanceList, action);
  }

  // oops... no se encontró ninguna regla, queda a confirmar por AGN
  return getOptListToken(turnoAvanceList, 'aconfirmar');
}

function paseFactory(user): Pase{
    const pase = new Pase();

    pase.sector = '';
    pase.paseTx = '';
    pase.fe_nov = devutils.txFromDate(new Date());
    pase.ho_nov = devutils.txFromHora(new Date());
    pase.fets_nov = new Date().getTime();
    pase.atendidox = new Atendido();

    
  if(user){
    if(user.isUsuarioWeb){
      pase.atendidox.userWebId = user._id;
      pase.atendidox.slug = user.nombre+' '+user.apellido;
    }else{
      pase.atendidox.userAdmId = user._id;
      pase.atendidox.slug = user.displayName;
    }
  }
    return pase;
}

export class TurnoHelper {
  static cleanQueryToken(query: TurnoQuery): TurnoQuery {
    if (!query) { return null; }

    Object.keys(query).forEach((key) => {
      if (query[key] == null || query[key] === 'no_definido') { delete query[key]; }
    });

    return query;
  }

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

  static getOptionToken(type, val) {
    if (!val) { return 'no_definido'; }

    if (!type) { return val; }

    return getOptListToken(this.getOptionList(type), val);
  }

  static getOptionEstado(type,val){
    if (!val) { return 'no_definido'; }
    if (!type) { return val; }
    return getEstado(this.getOptionList(type), val);
  }

  static getSedesList() {
    return sedesList;
  }

  static getSedeByKey(key: string) {
    return sedesList.find((item) => item.val === key).label;
  }

  static getTipoConsultaList() {
    return tipoConsultaList;
  }

  static getTipoConsultaByKey(key: string) {
    return tipoConsultaList.find((item) => item.val === key).label;
  }

  static getTurnoEstadosList() {
    return turnoEstadosList;
  }

  static getTurnoEstadoAvanceList() {
    return turnoAvanceList;
  }

  static buildTurneraBrowseDataTable(itemList: Turno[]): TurnoTable[] {
    return itemList.map((token) => {
      const tableCell = new TurnoTable();

      tableCell._id = token._id;
      tableCell.detalle = token.detalle;

      tableCell.displayName = token.requirente.displayName;
      tableCell.ndoc = token.requirente.ndoc;
      tableCell.txFechaHora = token.txFecha + ' ' + devutils.txFromHora(new Date(0,0,0,parseInt(token.txHora, 10)));
      tableCell.sala = token.sala;
      tableCell.estado = TurnoHelper.getOptionLabel('estado', token.estado);
      tableCell.sede = TurnoHelper.getOptionLabel('sede', token.sede);

      tableCell.tipoConsulta = TurnoHelper.getOptionLabel(
        'tipoConsulta',
        token.tipoConsulta
      );
      tableCell.avance = TurnoHelper.getOptionLabel('avance', token.avance);

      return tableCell;
    });
  }

  static buildPaseFromTurno(fvalue, user : User) : Pase {
    // va a retornar el turno con el pase
    const pase = paseFactory(user);

    let avance = transicionAvance('', user.isUsuarioWeb, fvalue.avance );
    pase.estado = avance.estado;
    pase.ejecucion = avance.val;
    pase.novedadTx = fvalue.novedadTx;  // se prioriza la leyenda que viene del form
    pase.isCumplida = avance.isCumplida;
    return pase;
  }

  static buildFirstPaseFromTurno(user) : Pase {
    const pase = paseFactory(user);

    let avance = transicionAvance('nuevo', user.isUsuarioWeb, 'crear' )
    pase.estado = avance.estado;
    pase.ejecucion = avance.val;
    pase.novedadTx = avance.label;
    pase.isCumplida = avance.isCumplida;

    return pase;
  }

  static buildPaseBajaFromTurno(user) : Pase {
    const pase = paseFactory(user);

    let avance = transicionAvance('cancelacion', user.isUsuarioWeb, 'cancelar' )
    pase.estado = avance.estado;
    pase.ejecucion = avance.val;
    pase.novedadTx = avance.label;
    pase.isCumplida = avance.isCumplida;

    return pase;
  }

  static buildPaseEditTurno(user, oldState: string) : Pase {
    const pase = paseFactory(user)

    let avance = transicionAvance((oldState || ''), user.isUsuarioWeb, 'editar' )
    pase.estado = avance.estado;
    pase.ejecucion = avance.val;
    pase.novedadTx = avance.label;
    pase.isCumplida = avance.isCumplida;

    return pase;
  }

}
