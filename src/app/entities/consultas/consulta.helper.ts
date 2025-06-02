import { Consulta, ConsultaTable, ConsultaQuery, Pase, Atendido, PasesList } from './consulta.model';
import { devutils } from '../../develar-commons/utils';

const ESTADO_END = 'cerrado';
const GENERO_TURNO = 'generoturno';
const SOLICITANTE = 'solicitante';
const COMUNICACION = 'comunicacion';

const estadosOptList = [
  {val: 'no_definido',    label: 'Sin selección',  slug:'Seleccione opción' },
  {val: 'activo',      label: 'Activa',      slug:'Activa' },
  {val: 'cerrado',     label: 'Cerrado',    slug:'Cerrado' },
  {val: 'suspendido',  label: 'Suspendida',  slug:'Suspendida' },
  {val: 'baja',        label: 'Baja',        slug:'Baja' },
]

const ejecucionOptList = [
  {val: 'no_definido',          estado: 'activo',  tipo:0, order:  1, label: 'Sin selección (activo)',         slug:'Sin selección',   },
  {val: 'emitido',              estado: 'activo',  tipo:0, order:  2, label: 'Emitida (activo)',               slug:'Emitida',         },
  {val: 'insertousuario',       estado: 'activo',  tipo:2, order: 16, label: 'Insertado por el usuario (activo)',   slug:'Insertado por el usuario'},
  {val: 'derivado',             estado: 'activo',  tipo:1, order: 11, label: 'Derivado (activo)',              slug:'Derivado',        },
  {val: 'enejecucion',          estado: 'activo',  tipo:1, order: 12, label: 'En ejecucion (activo)',          slug:'En ejecucion',    },
  {val: 'generoturno',          estado: 'cerrado', tipo:9, order: 15, label: 'Generó turno (cerrado)',         slug:'Generar turno presencial'},
  {val: 'cumplido',             estado: 'cerrado', tipo:1, order: 13, label: 'Cumplida (cerrado)',             slug:'Cumplida',        },
  {val: 'nocumplido',           estado: 'cerrado', tipo:1, order: 14, label: 'No cumplida (cerrado)',          slug:'No cumplida',     },
  {val: 'denegado',             estado: 'cerrado', tipo:9, order: 91, label: 'Denegado (cerrado)',             slug:'Denegado',      },
  {val: 'descartado',           estado: 'cerrado', tipo:9, order: 92, label: 'Descartado (cerrado)',           slug:'Descartado',      },
  {val: 'anulado',              estado: 'cerrado', tipo:9, order: 93, label: 'Anulado (cerrado)',              slug:'Anulado',         },
]

const consultaTypeOptList: Array<any> = [
  { val: 'no_definido',   scope: 'public', label: 'Sin selección' },
  { val: 'consulta',      scope: 'public', label: 'Consultar a distancia' },
  { val: 'consultaturno', scope: 'public', label: 'Consultar a distancia' },
  { val: 'asesoramiento', scope: 'public', label: 'Solicitar una asistencia técnica', slug: 'Técnica' },
  { val: 'solmaterial',   scope: 'public', label: 'Solicitar copias de documentación histórica', slug: 'Documentación' },
];

const sectoresOptList = [
  {val: 'comunicacion',    serial:'consulta',       label: 'Comunicación',        style: {'background-color': "#f2cded"}},
  {val: 'cineaudiovideo',  serial:'consulta',       label: 'Cine, audio, video',  style: {'background-color': "#f2cded"}},
  {val: 'fotografia',      serial:'consulta',       label: 'Fotografía',          style: {'background-color': "#f2aded"}},
  {val: 'documento',       serial:'consulta',       label: 'Documentos',          style: {'background-color': "#f2dded"}},
  {val: 'digitalizacion',  serial:'consulta',       label: 'Digitalización',      style: {'background-color': "#f2dded"}},
  {val: 'preservacion',    serial:'consulta',       label: 'Preservación',        style: {'background-color': "#f2dded"}},
  {val: 'administracion',  serial:'consulta',       label: 'Administración',      style: {'background-color': "#f2dded"}},
  {val: 'direccion',       serial:'consulta',       label: 'Dirección' ,          style: {'background-color': "#f2dded"}},
  {val: 'solicitante',     serial:'consulta',       label: 'Solicitante',         style: {'background-color': "#f2dded"}},
];


const tmaterialList = [
  { val: 'audiovisual', label: 'Audiovisual'},
  { val: 'fotografica', label: 'Fotográfica'},
  { val: 'escrita',     label: 'Escrita'}
]



const default_option_list: Array<any> = [
  { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];

const optionsLists = {
  default: default_option_list,
  estado: estadosOptList,
  ejecucion: ejecucionOptList,
  consultaType : consultaTypeOptList,
  sectores : sectoresOptList,
  tmaterial : tmaterialList
};

function getLabel(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.label : val;
}

function getSlug(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.slug : val;
}

function getEstado(list, val) {
  const t = list.find( (item) => item.val === val);
  return t ? t.estado : val;
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

function transicionEjecucion(isUserWeb: boolean, action?: string){
  if(action){
    if(action === "editar"){
      return getOptListToken(ejecucionOptList, 'enejecucion')
    }

    if(action === 'crear'){
      return getOptListToken(ejecucionOptList, 'insertousuario') 
    }

    // el nuevo estado de avance lo decide el caller
    return getOptListToken(ejecucionOptList, action);
  }
}


function getOptListToken(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t : null;
}

export class ConsultaHelper {
  static cleanQueryToken(query: ConsultaQuery): ConsultaQuery {
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

  static getOptionSlug(list, val) {
    if (!val) { return 'no_definido'; }
    return getSlug(this.getOptionList(list), val);
  }

  static getOptionLabel(type, val) {
    if (!val) { return 'no_definido'; }
    if (!type) { return val; }
    return getLabel(this.getOptionList(type), val);
  }

  static getOptionEstado(type, val) {
    if (!val) { return 'no_definido'; }
    if (!type) { return val; }
    return getEstado(this.getOptionList(type), val);
    
  }

  static getEjecucionList() {
    return ejecucionOptList;
  }

  static getConsultaEstadosList() {
    return estadosOptList;
  }

  static buildConsultasBrowseDataTable(itemList: Consulta[]): ConsultaTable[] {
    return itemList.map((token) => {
      const tableCell = new ConsultaTable();

      tableCell._id = token._id;
      tableCell.descripcion = token.description;
      tableCell.estado = ConsultaHelper.getOptionLabel('estado', token.estado);
      tableCell.ejecucion = token.ejecucion;
      tableCell.txFecha = token.fecomp_txa;
      tableCell.tsFecha = token.fecomp_tsa;
      // TODO: El slug del requirente aquí es un e-mail; debiera ser nombre y apellido
      tableCell.displayName = token.requirente.slug;
      // TODO: El requirente no tiene denormalizado el ndoc; hacerlo y mostrar el dato correcto
      // tableCell.ndoc = token.requirente.ndoc;
      tableCell.requirente = token.requirente;
      tableCell.ejecucion = ConsultaHelper.getOptionLabel('ejecucion', token.ejecucion);
      tableCell.sector = ConsultaHelper.getOptionLabel('sectores', token.sector);
      tableCell.tipo = ConsultaHelper.getOptionSlug('consultaType', token.type);
      tableCell.pasesCount = token.pases.length;
      tableCell.consulta = token;
      tableCell.isActive = token.isActive;

      /** Vamos a adaptar la vista según tmaterial */
      if(token.material && token.material.length){
        let display : string = "";
        token.material.forEach(item => {
          display = display + "<p class='mb-0'><b>Tipo de material:</b> "+ConsultaHelper.getOptionLabel('tmaterial',item.tmaterial)+"</p>";
          
          if(item.tmaterial === 'audiovisual'){
            display = display + "<p>"+item.titulo+"</p>";
          }else{
            display = display + "<p>"+item.destino+"</p>";
          }
        });
        tableCell.descripcion = display;
      }
      
      return tableCell;
    }).sort((a,b) =>
    b.tsFecha - a.tsFecha);
  }

  static generarPaseFromTurno(user) : Pase {
    const pase = paseFactory(user);
                pase.ejecucion = GENERO_TURNO;
                pase.novedadTx = 'Se generó un turno a partir de una consulta'
                pase.sector = SOLICITANTE;
                pase.estado = ESTADO_END;
                pase.isCumplida = true;

  return pase;
  }

  static generarPaseFValue(fvalue , user) : Pase {

    let estado = this.getOptionList('ejecucion').find(e => e.val === fvalue.ejecucion).estado;

    const pase = paseFactory(user);
    pase.ejecucion = fvalue.ejecucion;
    pase.novedadTx = fvalue.novedad_tx;
    pase.sector = fvalue.nuevo_sector;
    pase.paseTx = fvalue.tx_pase;
    pase.estado = estado;
    pase.isCumplida = estado === ESTADO_END ? true : false;


    return pase;
  }

  static generarPaseFromAddPase(novedadTx, user) : Pase {
    const pase = paseFactory(user);
    
    pase.novedadTx = novedadTx;
    pase.ejecucion = 'insertousuario';
    pase.estado = this.getOptionEstado('ejecucion',pase.ejecucion);
    pase.isCumplida = pase.estado === ESTADO_END ? true : false;
    pase.sector = COMUNICACION;
    return pase;
    
  }

  static generarPaseBaja(user) : Pase {

    const pase = paseFactory(user);
    let ejecucion = transicionEjecucion(user.isUsuarioWeb, "anulado");
    pase.ejecucion = ejecucion.val;
    pase.novedadTx = ejecucion.slug;
    pase.estado = ejecucion.estado;
    pase.isCumplida = false;

    return pase;
  }

  static generarPaseFromUpsertConsulta(user, isEdit : boolean) : Pase {

    const pase = paseFactory(user);
    let action = isEdit ? 'editar' : 'crear';
    let ejecucion = transicionEjecucion(user.isUsuarioWeb, action);
    pase.ejecucion = ejecucion.val;
    pase.novedadTx = isEdit ? 'Consulta modificada' : 'Inicio de la consulta';
    pase.sector = 'comunicacion';
    pase.paseTx = '';
    pase.estado = ejecucion.estado;
    pase.isCumplida = false;
    return pase;
  }

  static buildPasesList(pases : Pase[]) : PasesList[] {


    return pases.map( pase => {

      const paseItem = new PasesList();

      //paseItem.ejecucion = ConsultaHelper.getOptionList('ejecucion').find(e => e.val === pase.ejecucion).label;
      paseItem.ejecucion = ConsultaHelper.getOptionLabel('ejecucion',pase.ejecucion);
      paseItem.estado = pase.estado;
      paseItem.fecha = pase.fe_nov+ ' - '+pase.ho_nov;
      paseItem.tsFecha = pase.fets_nov;
      paseItem.novedad = pase.novedadTx;
      paseItem.pase = pase;
      paseItem.sector = ConsultaHelper.getOptionLabel('sectores', pase.sector);
      paseItem.sectorTX = pase.paseTx;
      paseItem.responsable = pase.atendidox.slug;

      return paseItem;
    }).sort((a,b) => {
      return b.tsFecha-a.tsFecha;
    })


  }

}

