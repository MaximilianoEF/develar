import { Asset, Serial } from '../../develar-commons/develar-entities';
import { Uco } from '../uco/uco.model';
import { UnidadDescripcion } from '../unidad-descripcion/unidad-descripcion.model';

/**
 * Modela una pila sencilla, con los métodos más básicos
 */
export class Stack<T> {
  _pila: T[] = [];

  push(elemento: T): void {
    this._pila.push(elemento);
  }

  // retorna y elimina el último elemento
  pop(): T | null {
    if (!this.isEmpty()) {
      return this._pila.pop();
    } else {
      return null;
    }
  }

  //chusmea (returna) el último elemento, pero no lo retira
  peek(): T | null {
    if (!this.isEmpty()) {
      return this._pila[this._pila.length - 1];
    } else {
        return null;
    }
  }

  isEmpty(): boolean {
    return this._pila.length === 0;
  }
}

export class QueueProgress {
  progress: number;
  status: string;
  queue: string;
  identifier: string;
  jobid: string;
}

export class MsrvTask {
  taskName: string;
  route: string;
  action: string;
  status: string;
  entityId: string;

  /* Opciones de configuración adicionales para la tarea */
  options: any;
}

export class UnidadDocumentalCompuesta {
    identificador: string;
    level_of_description: string;
    uds: Array<UnidadDocumentalSimple>;
    pathFolder: string;
}

export class UnidadDocumentalSimple {
  _id: string;

  assets: Array<Asset>;
}

export class UnidadDocumentalSimpleTable {
    _id: string;
    identificador: string;
    objetoDigital: string;
}

export class UcoData {
  identifier : string;
  cod_id : string          // Si la caja contiene una identificación, deberiamos tener guardado la referencia del mismo
  /** A continuación, se presentara el breadcumb para hallar la caja en cuestión (Referencia tentativa) */
  sede : string;
  sala : string;
  pasillo : string;
  estanteria : string;
  estante : string;
  /***/
  //La UCO puede tener como nivel de descripción UDC, ya que si se cargan UDS directamente en la misma, cumpliria el rol de UDC y tendría
  //cargado es isUco en TRUE, y el IngestProccess con los campos respectivos.
}

export class UdaHook {
  udaId : string;
  title : string;
  reference_code : Array<string>;
  identifier : string;
  level_of_description: string;

  constructor(ud : UnidadDescripcion){
    this.udaId = ud._id;
    this.title = ud.identificador.title;
    this.reference_code = ud.identificador.reference_code;
    this.identifier = ud.identificador.identifier;
    this.level_of_description = ud.identificador.level_of_description;
  }
}

/****************************
 * PROPUESTA DE MODELOS
 */

/****************************
 * IngestProcess contribuye con el proceso de alta de los nuevos objetos digitales
 * Este objeto cuelga de la ODC, que podría tener un history de ingesta
 *    ingest: IngestProcess;
 *    ingestHistory: Array<IngestProcess>
 */
export class IngestProcess {
  _id: string;
  admin: AdminData;
  slug: string; // descripción corta del
  ingestFolder: IngestFolder; // representa la carpeta elegida de ingesta, ver si hace falta tener un array;

  udaHook : UdaHook;

  assetList: Array<Asset> = [];
  assetHookList: Array<AssetHook> = [];

  udaList: Array<UnidadDescripcion> = [];

  // representa el archivo generado una vez lockeada la carpeta;
  // representaría una suerte de "dump" de objeto IngestaProcess
  manifiestAsset: AssetHook;

  // datos estadísticos: acumuladores, contadores, etc
  statistics: IngestSummary;

  // información referida al plan de digitalización + información recabada una vez que la misma finalizó
  // una persona revisó el material, determinó si la digitalización será anverso/reverso, etc
  ingestPlan: IngestPlan;
  serial?: Serial; // Lo vamos a utilizar solamente para dar de alta los datos dentro de admin.

  //Array de unidades de conservación
  ucos: Array<UcoProxy> = [];
}

export class AdminData {
  compId : string;
  compPrefix:  string = 'ING';
  compName:    string = 'P/Ingesta'; // Parte de INGESTA
  compNum: number; //Nro de comprobante de INGESTA, ver SERIALES
  fe_comp_ts : number;
  fe_comp_tx : string;
  sector: string;
  action: string;
  fe_tx: string; // fecha ingesta (posible uso, cuando se cierre el PI almacenar la fecha aquí)
  fe_ts: number; //
  approvedBy: Audit;
  audit: Audit; // datos del usuario a cargo
  estado: string; //activo, cerrado, baja
  avance: string; //emitido, vinculado, validado, ingestado
  avanceList : Array<string> = [];

  /** Tipo de parte de ingesta: master / derivada / etc */
  tipoParte: string = 'master';
}

export class Audit {
  userId: string;
  username: string;
  ts_alta: number;
};

// representa - identifica la carpeta seleccionada para la ingesta
export class IngestFolder {
  /** Punto de montaje en el server; por ejemplo: ingesta, master, derivadas-factory, etc */
  server: string = 'ingesta'; // el el server_name, véase core/models/asset.serverOptList

  assetId: string;

  serverPath: string; //ruta absoluta del punto de montaje
  path: string;       // ruta  a la carpeta desde serverPath
  rootPath: string;   // coincide con path, se mantiene esta property por consistencia con la API general.

  basename: string; // nombre de la rootFolder, que será intervenido con el assetId
  name:  string;    // nombre original de la rootFolder, que no cambia con el assetId

  isBaggit: boolean = false; // si paso por un proceso de baggit
  isLocked: boolean = false; // si está baggit, entonces está locked; probablemente primero se lockea, luego se hace baggit

  hasDerivadas: boolean = false;
  hasThumbnails: boolean = false;

  constructor(local: string){
    this.path = local;

  }
}

export class UcoProxy {
  id_uco : string;
  cod_uco : string;
  cod_barras : string;
  slug : string;

  constructor(uco : Uco){
    this.id_uco = uco._id;
    this.cod_uco = uco.cod_uco;
    this.cod_barras = uco.cod_barras;
    this.slug = uco.slug;
  }
}

export class IngestPlan {
//  planName: string; // Se retira porque paso a ser el "slug".
  itemPartRatio: number; // 1:1  1:2 (ejemplo anverso, reverso)
  partPredicates: Array<string>; // ejemplo: ['anverso', 'reverso'], cómo llamamos a las partes
  informeTxt: string; // Es el informe del área de Digitalización, lo ingresa en el marco de la creación del PI
  dpi : string;
  indicacionesTxt : string; // son las indicaciones impartidas por PRESERVACIÓN y ARCHIVÍSTICA en relación a cómo DIGITALIZAR
  userAdmin : string; //Almacena el id de mongo del usuario que seleccionamos dentro del desplegable.
  //udcPrefix : string;
  //udsPrefix : string; //Para cuando creemos de forma automática estos niveles, podemos tomar estos datos para construir el title.

  // Los parámetros sugeridos, luego convalidados con los efectivamente utilizados para digitalizar
  // Datos cargados por el personal de digitalización
  ingestParams: IngestParams;
}

// cumple el rol de CardGraph, vincula al Asset con la entidad
export interface AssetHook {
  // asset vinculado <-- representa el objeto digital
  assetId: string;
  assetParentId: string;
  assetType: string; // pdf, imagen, video, audio o FOLDER

  // este campo contiene el criterio de ordenamiento para la lista de ASSETS, a los efecto del MATCHING;
  // presumiblemente sea el nombre del archivo, dado por la máquina digitalizadora; así, por default
  // este campo toma el nombre del archivo digital
  // antes de insertar los registros en assetList, ordenar según este campo (arrays.sort)
  orderBy: string;

  // datos duros del objeto digital que si bien están en el registro asset, viene bien tenerlos acá:
  assetName: string;  // nombre del asset (sin el hash, y sin la extensión)
  assetFilename: string; // nombre del asset (sin hash y con la extensión)
  assetSlug: string;  // slug del asset (nombre editado, que oficia de displayAs)


  // en las fichas de +1, es el "rol" que el objeto cumple respecto de otro, por ejemplo
  // qué rol juega este asset respecto de la UDS/UDC
  predicate: string;


  // Datos del ÍTEM con que se vincula
  isVinculado: boolean; // si el asset está vinculado a UDS o no

  // estos datos a continuación tienen sentido si isVinculado=true
  // itemId tiene el mismo valor si los asset-hooks forman parte de un anverso/reverso
  itemId: string; // ID mongo de la UDS
  itemParentId: string; // ID mongo de la UD parent
  itemName: string; // descripción de la UDS
  itemIdentifier: string; // identificador de la UDS
  itemRole: string; // es MASTER (por default), DERIVADA
  itemLevel: String; // UDC, UDS, PART

  isPart: boolean; // si es true, entonces implica que hay más de un asset por UDS
  partCardinal: number; // 1, 2, 3...
  partPredicate: string; // anverso/reverso   /audio/video/
}

export class IngestSummary {
  // true=modo alta, sino modo modificación
  isAlta: boolean;
  hasVinculados: boolean; // asumo que refiere a los assetHooks,  qué era esta variable???
  vinculadosCount: number; //

  // métricas cardinales
  udsCount: number;
  assetsCount: number;
}

export class IngestParams {
  machineId: string; // máquina utilizada
  machineSlug : string;
  machineTypeDigitalizacion : string;
  machineCod : string;
  machineReport: string; // texto con los parámetros usados
}


/****************************/
/****************************/
/****************************/
/****************************/
/****************************/

/****************************
 * COPIA DE LOS MODEL DE  UNIDAD DE DESCRIPCION
 */

export interface CardGraph {
	entity: string;
	displayAs: string;
	predicate: string;
	slug: string;
	description: string;
	avatar: string;
	entityId: string;
	mimetype?: string;
}

/**
 * Describe el campo 'audit', utilizado con propósitos de 'auditoría',
 * es decir permitiendo determinar en particular quién creó el registro y quién lo
 * modificó por última vez. En segunda instancia, se usa con propósitos históricos
 */
export class AuditUD {
  navance: string = 'emitido';

  creationDate: string;
  creationDateTs: number;
  creationUserID: string;
  creationUsername: string;
  creationUserEmail: string;

  lastModifiedDate: string;
  lastModifiedDateTs: number;
  lastModifiedUserID: string;
  lastModifiedUsername: string;
  lastModifiedUserEmail: string;
  lastModifiedReason: string;
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
  historia: string;
  institucion: string;
  origen: string;
}


/**
 * Describe una búsqueda de unidad de descripción, realizada al backend
 */
export class UnidadDescripcionQuery {
  descriptionlevel?: string;
  title?: string;
  estado?: string;
  navance?: string;
  codigo_referencia?: string;
  codigo_referencia_exact?: string;
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


/** IngestProcess */

export class IngestProcessAltaRapida {
  user : string;
  fe_comp_tx : string;
  fe_comp_ts : number;
  fe_tx : string; //Ingresado por el usuario
  fe_ts : number; // Ingresado por el usuario
  slug : string;
  serial : Serial;

}

/*** Model de scanFolder */

export class ScanFolder {
  publicPath: string;
  serverPath: string;
  rootPath: string;
  searchRoute: string;
  basename: string;
  server: string;

  files :      ScanFolderFile[];
  filesCount:  number;
  folders:     string[];
  folderCount: number;
}

export class ScanFolderFile {
  extension : string;
  count : number;
}

export class FolderTree {
  children : Array<FolderTree> = [];
  filename : string;
  path : string;
  fileType: string;
  size : string;
  type: string;
  url?: string;
  _id?: string;
}

/**
 * Modela un ítem del árbol de UDC / UDS
 */
export class UnidadDescripcionTree {
  _id: string;
  parentId: string;
  title: string;
  children: Array<UnidadDescripcionTree> = [];
  level_of_description: string;
}
export class IngestProcessQuery {
  compNum? : number;
  slug? : string;
  avance? : string;
  fechaDesde?: number;
  fechaHasta?: number;
}

export class IngestProcessDataTable {
  _id : string;
  compNum : number;
  slug : string;
  fecha_tx : string;
  fecha_ts : number;
}

/** Modelo de datos para vista tabla asset */
export class AssetTableData {
  fileType : string;
  assetType : string;
  filename : string;
  bundlePath : string;
  idAsset : string;
  isDirectory: boolean;
  isFile: boolean;
}
