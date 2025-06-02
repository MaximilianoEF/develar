import { Asset, Serial } from '../../develar-commons/develar-entities';
import { Uco } from '../uco/uco.model';


export class TeamMember {
  userId: string;
  username: string;
  role: string; // roleOptList;
}

export class HitoProject {
  fecha_hito_tx: string;
  fecha_hito_ts: number;
  t_hito: string; // hitoOptList
  q_hito: number = 0;
  q_ume: string;

  slug: string;
  descripcion: string;
}

export class Audit {
  userId: string;
  username: string;
  ts_alta: number;
};

export class Quantity {
  q_item: number;
  ume_item: string;
  id_item: string; // mongoId si se trata de un item
  t_item: string; //itemTypeOptList: uco|folder
  c_ubi: string; // ubicacionOptList: deposito, conservación; isla;
}

export class ActionProject {
  c_action: string; // es unique para un dado proyecto

  q_nom_accion: number;
  q_desag_accion: number;
  fe_accion_tx: string;
  fe_accion_ts: number;

  q_nom_realizado: number;
  q_desag_realizado: number;
  fe_realizado_tx: string;
  fe_realizado_ts: number;
  
  q_nom_verificado: number;
  q_desag_verificado: number;
  fe_verificado_tx: string;
  fe_verificado_ts: number;

  ume_item: string;
  isDesagregado: boolean = false;
  t_item: string; //itemTypeOptList: uco|folder
  c_ubi: string; // ubicacionOptList: deposito, conservación; isla;
  estado: string;
  avance: string;
  observacion: string;

  fe_prev_inicio_tx: string;
  fe_prev_inicio_ts: number;
  fe_prev_final_tx: string;
  fe_prev_final_ts: number;
}

export class UdaProjectHook {
  fondoId: string; //identificador mongo del fondo

  // identificador del nivel isad-g al que machea el proyecto
  udaId : string; // id mongo de la serie

  reference_code : Array<string>; // AR-AGN-CC01-fotografia ==> ["AR", "AGN", "CC01", "fotografia"]
  identifier : string; // 'fotografia'
  title : string; // 'Fotos redacción Caras y Caretas'
  level_of_description: string; //'serie' serie-facticia|seccion|subfondo|fondo

}

export class UcoHook {
  _id: string;
  project_id: string;
  project_compName:    string = 'Proyecto'; // proyecto|subproyecto|actividad
  project_compNum: number; //Nro de comprobante de INGESTA, ver SERIALES
  c_action: string; //actionOptList


  uco_id: string;
  cod_uco: string;

  current_action: string; //action
  c_ubi: string; //ubicacionOptList
  fe_novedad_tx: string;
  fe_novedad_ts: string;
  observacion: string; 

}

export class ParteAvanceAccionProyecto {
  _id: string; 
  project_id: string;
  c_action: string;
  fe_parte_tx: string;
  fe_parte_ts: string;
  q_cant: string;
  q_ume: string;

  acumAction: boolean = false;
  acumRealizado: boolean = true;
  acumVerificado: boolean = true;

  audit: Audit;

  ucoList: string[] = []; // lista de uco_id

}

export class Project {
  _id: string; // ObjectId()
  t_project: string; // tprojectOptList: proyecto; actividad 
  compPrefix:  string = 'PRO';
  compName:    string = 'Proyecto'; // proyecto|subproyecto|actividad
  compNum: number; //Nro de comprobante de INGESTA, ver SERIALES
  isFantasma: boolean = false; // true == se crea el nivel como paraguas de los subniveles

  slug: string; // descripción corta
  description: string; // descrición 
  fe_comp_ts: number;
  fe_comp_tx: string;

  // estado
  estado: string;  //estadoProjOptList : activo|cerrado
  navance: string; //navanceProjOptList : emitido|enproceso|encola|realizado|verificado

  // parent
  parentProjectId: string;
  parentProjectSlug: string;
  rootProjectId: string;

  // Encuadre
  sector: string;  // aintermedio|fotografia|escritos|conservacion|audiovideo|digitalizacion|tecnologia
  udaHook: UdaProjectHook;

  // Acciones relevadas
  actionList: Array<string> = [] // identificacion|invanalitico|conservacion|preparacion|digitalizacion|ingesta|perfeccionamiento|qcalidad
  actionTokens: ActionProject[] = [];
  
  // equipo coordinador
  teamList: TeamMember[] = [];

  // Hitos
  hitosList: HitoProject[] = [];

  q_project: Quantity ;

}