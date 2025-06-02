import { BehaviorSubject, Observable } from 'rxjs';
import { Condiciones } from '../../agn/models/vidaQuery.model';
import { CardGraph } from '../../develar-commons/asset-helper';
import { Asset } from '../../develar-commons/develar-entities';
import { AssetHook, UcoData } from '../ingesta/ingesta.model';


export class UnidadDescripcion {
  _id: string;
  identificador: IdentificadorUD;
  contexto: ContextUD;
  contenidoYEstructura: ContenidoYEstructura;
  accesoYUso: AccesoYUsoUD;
  controlDeLaDescripcion: ControlDescripcion;
  notes: Array<string>;
  documentacionAsociada: DocumentacionAsociadaUD;
  puntoAcceso: PuntoAcceso;

  dataWord: string; // Se incluirá el texto copiado en el textarea,
  assets: Array<CardGraph>;
  parent: ParentUD;
  // children: Array<ChildrenUD>;
  audit: AuditUD;

  company: CompanyUD;

  /* Properties relacionadas con el proceso de ingesta */
  ingest: Array<IngestProxy> = [];

  //ingestHistory: Array<IngestProcess>;
  assetHooks: Array<AssetHook> = [];
  ucoData: UcoData;
  isUco: boolean; //Indicará si es una unidad de conservación física. Si es Falso, no nos preocupamos por el ucoData (null);
  //Si es TRUE, tienen que cargar minimente el codigo del identifier de la caja física.
  udsNumber?: number; //Atributo que vamos a utilizar para poder dar de alta multiples uds
  startIn?: number; //Número por el cual vamos a iniciar la secuencia de número de identifiers


  estado: string = 'activo';
  /** Slug en AtoM, para UDAs importadas desde allí */
  atomSlug: string = ''
  isAtom: boolean = false;

  /** Lote de acciones de UDA */
  actions: ActionUda[];

  constructor() {
    this.identificador = new IdentificadorUD();
    this.contexto = new ContextUD();
    this.contenidoYEstructura = new ContenidoYEstructura();
    this.accesoYUso = new AccesoYUsoUD();
    this.audit = new AuditUD();
    this.controlDeLaDescripcion = new ControlDescripcion();
    this.actions = [];
  }
}
export class ControlDescripcion {
  description_identifier: string;
  institution_identifier: string;
  rules_and_or_conventions_used: string;
  status: string;
  level_of_detail: string;
  "Dates of creation revision deletion": string;
  physical_characteristics_and_technical_requirements: string;
  languages_of_description: string[];
  scripts_of_description: string[];
  archivists_notes: string[];
}
export class ParentUD {
  _id: string;
  id_parent: string;
  title: string;
  level_of_description: string;
  identifier: string;
  reference_code: Array<string>;
  parentAtomSlug: string;
  relacionActualizada: string;

}

export class ChildrenUD {
  _id: string;
  id_children: string;
  title: string;
  level_of_description: string;
  identifier: string;
  reference_code: Array<string>;
  childrenAtomSlug: string;
}

export class DatesUD {
  type: string = 'Accumulation';
  date: string; //Fecha texto
  start_date: string;
  start_date_ts: number;
  end_date: string;
  end_date_ts: number;
  observacion: string;
}

export class IdentificadorUD {
  identifier: string;
  reference_code: Array<string> = [];
  level_of_description: string;
  title: string;
  dates: Array<DatesUD>;
  extent_and_medium: string;
}

/**
 * Describe el campo 'audit', utilizado con propósitos de 'auditoría',
 * es decir permitiendo determinar en particular quién creó el registro y quién lo
 * modificó por última vez. En segunda instancia, se usa con propósitos históricos
 */
export class AuditUD {
  navance: string = 'emitido';

  creationDate: string;
  creationDateTs: number = Date.now();
  creationUserID: string;
  creationUsername: string;
  creationUserEmail: string;
  isIngestado: boolean = false;

  lastModifiedDate: string;
  lastModifiedDateTs: number = Date.now();
  lastModifiedUserID: string;
  lastModifiedUsername: string;
  lastModifiedUserEmail: string;
  lastModifiedReason: string;

  procedureTxt: string; //Instrucciones del archivista para el digitalizador

  inventario: string;

  
  /**
   * Determina si el registro ya forma parte de una exportación para AtoM
   */
  transferidoAtom: boolean;

  /**
   * Usuario que realizó una exportación a AtoM para esta UDA
   */
  transferidoAtomUsuario: string;

  /**
   * Timestamp en que se realizó una exportación a AtoM para esta UDA
   */  
  transferidoAtomTimestamp: number;



  numLoteImportacion: string;
}

export class CompanyUD {
  // personId: string;
  // displayName: string;
  // tdoc: string;
  // ndoc: string;
  // countryPrefix: string;
  // companyPrefix: string;

  authorityRecordId: string;
  displayName: string;
  countryPrefix: string;
  identifier: string;
}

export class PuntoAcceso {
  place_access_points: string[];
  name_access_points: string[];
  subject_access_points: string[];
  genre_access_points: string[];

  // hasTaxonomyAccesPoints (booleano) (indexar en Mongo por este campo)
  // taxonomy_access_points (taxonomía nuestra)[]
  // id tax. - termino normalizado - displayAs (para este registro, como esta escrito el termino)
}

/**
 * Representa el área de contexto de la unidad de descripción
 *
 */
export class ContextCreatorUD {
  // ID Mongo del registro de autoridad
  authorityRecordId: string;
  // identityArea.authorizedName
  authorityRecordName: string;
  // controlArea.identifier
  authorityRecordIdentifier: string;
}
export class ContextUD {
  creators: Array<ContextCreatorUD>;
  archival_history: string;
  repository: string;
  immediate_source_of_acquisition_or_transfer: string;
}

export class IngestProxy {
  ingestProcessId: string;
  slug: string;
  compNum: number;
}

/**
 * Describe una búsqueda de unidad de descripción, realizada al backend
 */
export class UnidadDescripcionQuery {
  descriptionlevel?: string;
  identifier?: string;
  title?: string;
  estado?: string;
  navance?: string;
  codigo_referencia?: string;
  codigo_referencia_exact?: string;
  ingest?: any;
  recurso?: string;
  logica?: string;
  condiciones?: Array<Condiciones>;
  inventario?: string;
  parentIdentifier?: string;
  parent?: string;
  /** Campos que usaremos para determinar las actions */
  type?: string;
  actionId?: string;
  // Tipo de reporte
  reporte?: string;
  // Proviene de AtoM?
  isAtom?: boolean;
  // Proviene de GDoc y fue migrada a AtoM?
  transferidoAtom?: boolean;
}

/**
 * Describe un resultado de búsqueda de unidad de descripción, al
 * visualizarse en la tabla del navegador
 */
export class UnidadDescripcionTable {
  _id?: string;
  identifier?: string;
  title?: string;
  descriptionlevel?: string;
  atomSlug?: string;
  date?: string;
  reference_code?: string;
  assetIds?: string[];
  isUDCorUDS: boolean = false;
  isTransferidaAtom: boolean = false;
}

/**
 * Describe una entrada del historial, tal como se recibe del backend
 */
export class UnidadDescripcionHistoryEntry {
  changedBy?: string;
  changedAt?: string;
  updatedAt?: string;
  reason?: string;
  comment?: string;
}

/**
 * Describe una entrada del historial, ajustada para ser mostrada
 * en el frontend
 */
export class UnidadDescripcionHistoryList {
  version?: number;
  detalle?: string;
  motivo?: string;
  fechaCreacion?: string;
}

export class JerarquiaUD {
  id_ud: string;
  identifier: string;
  level_of_description: string;
  mapKey: string;
  propiedad: string;
  value: string;

  isArray: boolean;
  valueArray: any;
}

export class EspecificacionesUD {
  system_of_arrangement: string;
  type: string;
}

export class ContenidoYEstructura {
  action: string;
  scope_and_content: string;
  contenido: string;
  appraisal_destruction_and_scheduling: string;
  isAcumulacion: boolean;
  accruals: string;
  especificaciones: Array<EspecificacionesUD>;
}

export class AccesoYUsoUD {
  conditions_governing_access: string;
  conditions_governing_reproduction: string;
  languages_of_material: string[];
  scripts_of_material: string[];
  notas: string;
  physical_characteristics_and_technical_requirements: string;
  finding_aids: string;
}

export class DocumentacionAsociadaUD {
  existence_and_location_of_originals: string;
  existence_and_location_of_copies: string;
  related_units_of_description: string;
  related_descriptions: string;
  publication_notes: Array<string>;
}



export class MinimalChildren {
  type: string;
  length: number;
}

export class ApareoUda {
  idUda: string;
  idParent: string;
  title: string;
  identifier: string;
  reference_code: Array<string>;
  isIngestado: boolean;
  level_of_description: string;
  assetsIds: Array<string>;
  assets: Array<Asset>;
  estado: string;
  actions: ActionUda[];
}

export class IngestadosAndNoIngestados {
  ingestados: BehaviorSubject<Array<ApareoUda>>;
  noIngestados: BehaviorSubject<Array<ApareoUda>>;

  constructor() {
    this.ingestados = new BehaviorSubject<Array<ApareoUda>>([]);
    this.noIngestados = new BehaviorSubject<Array<ApareoUda>>([]);
  }
}

export class ActionUda {
  /** Entrada de OPT-List actionUDA */
  type: string;
  /** Identificador igresado por el usuario para darle identidad al work-in-progress */
  actionId: string;

  /** Que rol cumplio en ese proceso */
  role: string;
  /** Fecha de acción */
  fe_tx: string;
  fe_ts: number;

  /** Usuario que realiza la acción */
  userId: string;
  userName: string;

}

export class UdAssets {
  idParent: string;
  idUda: string;
  title: string;
  reference_code: string[];
  level_of_description: string;
  assetIds: string[];
  // hasPDF$: Observable<boolean> = new Observable<boolean>();
  hasPDF: boolean;
}


/**
 * Modela el resultado de una preparación de resultados para
 * luego ser exportados a AtoM
 */
export interface AtomPrepResult {
  /**
   * Número de registros que se van a migrar
   */
  cantidad: number;

  /**
   * Timestamp en que se produce la migración
   */
  timestamp: number;
}