import { devutils } from '../../develar-commons/utils';
import { Serial }   from '../../develar-commons/develar-entities';

import { Person }     from '../../entities/person/person';

import { Consulta, Atendido, Requirente } from './consulta.model';
import { Pase, ConsultaTable, NovedadItem } from '../../entities/consultas/consulta.model';
import { ConsultaHelper } from '../../entities/consultas/consulta.helper';
import { UsuarioWeb } from '../../entities/userweb/usuario-web';


export class  ConsultasHelper {

  static getOptionlist(type){
    return optionsLists[type] || optionsLists['default'];
  }

  static getOptionLabelFromList(list, val){
    if(!val) return 'no-definido';
    return getLabel(list, val);
  }

  static getOptionLabel(type, val){
    if(!val) return 'no-definido';
    if(!type) return val;
    return getLabel(this.getOptionlist(type), val);
  }

  static getOptionItem(list, val){
    if(!val) return 'no-definido';
    return getOptionListToken(list, val);
  }

  static getPrefixedOptionLabel(type, prefix, val){
    if(!val) return 'no-definido';
    if(!type) return prefix + '::' + val;
    return getPrefixedLabel(this.getOptionlist(type), prefix, val);
  }


	static consultaSerial(){
		let sector = 'comunicacion';
		let type = 'consulta';
		let name = 'solicitud';
		return buildSerialConsulta(type, name, sector);


  }

	static initNewConsulta(spec?): Consulta{
		let consulta = new Consulta()

		return consulta;
  }

  static generarPaseBaja(user) : Pase {

    let estado = 'baja'
    const pase = new Pase();
    pase.ejecucion = 'anulado';
    pase.novedadTx = 'Solicitud anulada';
    pase.sector = '';
    pase.paseTx = '';
    pase.estado = estado;
    pase.isCumplida = false;
    pase.fe_nov = devutils.txFromDate(new Date());
    pase.ho_nov = devutils.txFromHora(new Date());
    pase.fets_nov = new Date().getTime();
    pase.atendidox = new Atendido();
    pase.atendidox.userAdmId = user._id;
    pase.atendidox.slug = user.displayName;


    return pase;
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
      tableCell.tipo = ConsultaHelper.getOptionLabel('consultaType', token.type);
      tableCell.type = token.type;
      tableCell.pasesCount = token.pases.length;
      tableCell.consulta = token;
      tableCell.isActive = token.isActive;

      tableCell.novedadesList = [];

      if (tableCell.pasesCount > 0) {
        token.pases
          .filter((item) => item.atendidox.userAdmId && item.novedadTx !== null)
          .forEach((item, index) => {
          const novedad = new NovedadItem();
          novedad.description = item.novedadTx;
          novedad.txFecha = item.fe_nov;
          novedad.txHora = item.ho_nov;

          tableCell.novedadesList.push(novedad);
        });
      }

      if (tableCell.novedadesList.length > 0) {
        tableCell.hasNovedades = true;
      } else {
        tableCell.hasNovedades = false;
      }

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
    b.tsFecha - a.tsFecha);;
  }

  // static cleanQueryToken(query:SolInternacionBrowse, cleanAsistenciaId:boolean = true):SolInternacionBrowse{
  //   if(!query) return null;

  //   Object.keys(query).forEach(key =>{
  //     if(query[key] == null || query[key] == 'no_definido' ) delete query[key];

  //     if(key === 'fecomp_h' || key === 'fecomp_d')  delete query[key];
  //     if(key === 'feDesde'         && !query[key]) delete query[key];
  //     if(key === 'feDesde_ts'      && !query[key]) delete query[key];
  //     if(key === 'feHasta'         && !query[key]) delete query[key];
  //     if(key === 'feHasta_ts'      && !query[key]) delete query[key];

  //   })

  //   return query;
  // }


}

function buildSerialConsulta(type, name, sector){
	let serial = new Serial();
	serial.type = type; // internacion
	serial.name = name; // solinternacion
	serial.tserial = 'solicitud';
	serial.sector = sector; //  alimentos; nutricion; etc;
	serial.tdoc = 'solicitud';
	serial.letra = 'X';
	serial.anio = 0;
	serial.mes = 0;
	serial.dia = 0;
	serial.estado = 'activo';
	serial.punto = 0;
	serial.pnumero = 1;
	serial.offset = 400000;
	serial.slug = 'Consulta usuario AGN';
	serial.compPrefix = 'SOL';
	serial.compName = 'S/Consulta';
	serial.showAnio = false;
	serial.resetDay = false;
	serial.fe_ult = 0;

	return serial;


}

function buildSerialForDocumProvorio(){
    let serial = new Serial();
    serial.type = 'person';
    serial.name = 'docum';
    serial.tserial = 'provisorio';
    serial.sector = 'personas';
    serial.tdoc = 'identidad';
    serial.letra = 'X';
    serial.anio = 0;
    serial.mes = 0;
    serial.dia = 0;
    serial.estado = 'activo';
    serial.punto = 0;
    serial.pnumero = 1;
    serial.offset = 100000;
    serial.slug = 'PROV';
    serial.compPrefix = 'PROV';
    serial.compName = 'Identif Provisoria';
    serial.showAnio = false;
    serial.resetDay = false;
    serial.fe_ult = 0;
    return serial;
}


function buildRequirente(person: Person, user: UsuarioWeb): Requirente {
	let req:Requirente = {
		personId:  person._id ,
		userId:    user._id ,
		slug:      person.displayName ,
	}

	return req;
}

function getOptionListToken(list, val){
  let t = list.find(item => item.val === val)
  return t ? t : null;
}

function getLabel(list, val){
    let t = list.find(item => item.val === val)
    return t ? t.label : val;
}

function getOptListToken(list, val){
    let t = list.find(item => item.val === val)
    return t ? t : null;
}

function getPrefixedLabel(list, prefix, val){
    let label = getLabel(list, val);
    if(label) {
      label = prefix ? prefix + ': ' + label : ' ' + label
    }
    return label;
}




/****************
  OptionLists  /
**************/
const actionsOptList: Array<any> = [
        {val: 'no_definido', isRemitible: false,  key:'',           type:'Sin selección',  label: 'Sin selección' },
        {val: 'internacion', isRemitible: false,  key:'modalidad',  type:'internacion',       label: 'Internación' },
];



const ejecucionOptList = [
  {val: 'no_definido',          estado: 'activo',  tipo:0, order:  1, label: 'Sin selección (activo)',         slug:'Sin selección',   },
  {val: 'emitido',              estado: 'activo',  tipo:0, order:  2, label: 'Emitida (activo)',               slug:'Emitida',         },
  {val: 'derivado',             estado: 'activo',  tipo:1, order: 11, label: 'Derivado (activo)',              slug:'Derivado',        },
  {val: 'enejecucion',          estado: 'activo',  tipo:1, order: 12, label: 'En ejecucion (activo)',          slug:'En ejecucion',    },
  {val : 'generoturno',         estado: 'cerrado', tipo:9, order: 15, label: 'Generó turno (cerrado)',         slug:'Generar turno presencial'},
  {val: 'cumplido',             estado: 'cerrado', tipo:1, order: 13, label: 'Cumplida (cerrado)',             slug:'Cumplida',        },
  {val: 'nocumplido',           estado: 'cerrado', tipo:1, order: 14, label: 'No cumplida (cerrado)',          slug:'No cumplida',     },
  {val: 'denegado',             estado: 'cerrado', tipo:9, order: 91, label: 'Denegado (cerrado)',             slug:'Denegado',      },
  {val: 'descartado',           estado: 'cerrado', tipo:9, order: 92, label: 'Descartado (cerrado)',           slug:'Descartado',      },
  {val: 'anulado',              estado: 'cerrado', tipo:9, order: 93, label: 'Anulado (cerrado)',              slug:'Anulado',         },
]

const consultaTypeOptList: Array<any> = [
  { val: 'no_definido',   scope: 'public', help: '', label: 'Sin selección' },
  { val: 'consulta',      scope: 'public', help: 'Consulta | ',  label: 'CONSULTA GENERAL' },
  { val: 'consultaturno', scope: 'public', help: 'Consulta | ',  label: 'CONSULTA: Preconsulta para obtener turno visita presencial' },
];

const consultaTypeHelpList: Array<any> = [
        {val: 'no_definido',   label: 'Sin selección' },
        {val: 'consulta',      label: 'Consulta u orientación general'           },
        {val: 'asesoramiento', label: 'Servicio de asesoramiento integral disponible para instituciones' },
        {val: 'solmaterial',   label: 'Solicitud de material en alta definición' },
];

const servicioTypeOptList: Array<any> = [
  { val: 'no_definido',   scope: 'public', help: '',  label: 'Seleccione una opción' },
  { val: 'asesoramiento', scope: 'public', help: 'Solicitud de asistencia emitida el ',     label: 'Asistencia técnica' },
  { val: 'solmaterial',   scope: 'public', help: 'Solicitud de documentación emitida el ',  label: 'Envío de documentación digitalizada' },
];

const servicioTypeHelpList: Array<any> = [
        {val: 'no_definido',   label: 'Sin selección' },
        {val: 'asesoramiento', label: 'Servicio de asesoramiento integral disponible para instituciones' },
        {val: 'solmaterial',   label: 'Solicitud de material en alta definición' },
];


const estadosOptList = [
      {val: 'no_definido',    label: 'Sin selección',  slug:'Seleccione opción' },
      {val: 'activo',      label: 'Activa',      slug:'Activa' },
     // {val: 'cumplido',    label: 'Cumplida',    slug:'Cumplida' },
      {val: 'cerrado',     label: 'Cerrado',    slug:'Cerrado' },
      {val: 'suspendido',  label: 'Suspendida',  slug:'Suspendida' },
      {val: 'baja',        label: 'Baja',        slug:'Baja' },
]

const intervencionOptList = [
		{ val: 'no_definido',        label: 'Sin selección'},
		{ val: 'urgencia',           label: 'Atención Urgencia'},

]


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

const estadosSolicitudOptList: Array<any> = [
    {val: 'activo',      ord: '1.1', label: 'activo'     },
    {val: 'cumplido',    ord: '1.1', label: 'cumplido'     },
    {val: 'baja',        ord: '1.1', label: 'baja'     },
];


const default_option_list: Array<any> = [
        {val: 'nodefinido',   type:'nodefinido',    label: 'nodefinido' },
];

const intervencionManager = {
		urgencia: {
			isActive: true,
			hasNecesidad: true,
			hasCumplimiento: true,
			ejecucion: 'urgente',
			sector: 'coordinacion',
			urgencia: 3,
			tnovedad: 'urgencia',
			novedad: 'Atención Urgencia'
		},
		hisopar: {
			isActive: true,
			hasNecesidad: true,
			hasCumplimiento: true,
			ejecucion: 'emitido',
			sector: 'coordinacion',
			urgencia: 2,
			tnovedad: 'intervencion',
			novedad: 'Hisopar'
		}
}

const optionsLists = {
   default: default_option_list,
   actions: actionsOptList,
   sectores: sectoresOptList,
   consultaType: consultaTypeOptList,
   servicioType: servicioTypeOptList,
   consultaHelp: consultaTypeHelpList,
   estados: estadosOptList,
   ejecucion : ejecucionOptList
}

