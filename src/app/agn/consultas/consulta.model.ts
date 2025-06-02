import { devutils } from '../../develar-commons/utils';


export class Pase {
  _id : string;
  fe_nov: string;
  ho_nov : string;
  fets_nov: number = 0;
  emisor: string;
  ejecucion: string = ''; //ejecucionOptList;
  novedadTx : string = '';


  sector: string = '';
  estado : string = '';
  paseTx : string = '';

  isCumplida: boolean = false;
  atendidox: Atendido;
}

export class Atendido {
  userAdmId: string;
  userWebId: string;
  slug: string;
}

export class Requirente {
  userId: string;
  personId: string;
  slug: string;
}

export class AsesoramientoTecnico {
  institucion: string; // institución solicitante
  cuit: string;
  solicitud: string; // tipo de asistencia técnica requerida
  contacto: string; // correo institucional
  telefono: string; // telefono institucional
}

export class MaterialSolicitado {
  tmaterial: string;
  identificador: string;
  destino: string;
  fondodocumental: string;
  seriedocumental: string;
  numeropieza: string;
  titulo: string;
  timescode: string;
  fecha : string;
}

export class Consulta {
  _id?: string;
  isActive: boolean = false;
  type: string = 'consulta'; //consultaTypeOptList

  //intervencion: string = '';
  urgencia: number = 0; // 1,2,3
  fecomp_txa: string;
  fecomp_tsa: number;

  description: string = '';

  sector: string = ''; // salud.model.sectores

  hasNecesidad: boolean = false;
  fe_necesidad: string = '';
  fets_necesidad: number = 0;

		hasCumplimiento: boolean = false;
		estado: string = 'activo'; // estadosOptList
		ejecucion: string = 'emitido'; // ejecucionOptList

  pases: Pase[] = [];
  //atendidox: Atendido;
  requirente: Requirente;
  asesoramiento: AsesoramientoTecnico;
  material: Array<MaterialSolicitado> = [];

  constructor() {
    const hoy = new Date();

    this.fecomp_tsa = hoy.getTime();
    this.fecomp_txa = devutils.txFromDate(hoy);
  }
}

export class NovedadItem {
  description: string;
  txFecha: string;
  txHora: string;
}


export class ConsultaTable {
  _id: string;
  estado: string;
  ejecucion: string;
  ndoc: string;
  displayName: string;
  txFecha: string;
  tsFecha : number;
  descripcion: string;
  requirente: Requirente;
  sector: string;
  tipo: string;
  type: string;
  pasesCount : number;
  isActive : boolean;
  consulta: Consulta;

  hasNovedades: boolean = false;
  novedadesList: NovedadItem[] = [];

}

export class ConsultaQuery {
  fechaDesde: string;
  fechaHasta: string;
  estado: string;
  sector : string;
  type: string;
  modoconsulta: string;
}



