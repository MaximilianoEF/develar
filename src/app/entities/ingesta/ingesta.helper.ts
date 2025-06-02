import { UnidadDescripcionHelper } from '../unidad-descripcion/unidad-descripcion.helper';
import {
  AssetTableData,
  Audit,
  IngestFolder,
  IngestProcess,
  IngestProcessDataTable,
  IngestProcessQuery,
} from './ingesta.model';
import { UnidadDescripcion } from '../unidad-descripcion/unidad-descripcion.model';
import { Serial, Asset } from '../../develar-commons/develar-entities';
import { FolderTree, AssetHook, UnidadDescripcionTree } from './ingesta.model';
import { User } from '../user/user';

const DIGITALIZACION : string = 'digitalizacion'; //Constante que refiere al val de la optList de sectores;
const ALTA_MASTER : string = 'alta-master'; //Constante que refiere al val de la optList de actions;

const EN_PROCESO : string = 'en_proceso'; //avance por omisión;
const TYPE_UDS: string = 'item';
const PADDING_ZEROS = '00000';
const PADDING_ZEROS_CNT = PADDING_ZEROS.length;

const defaultOptionList = [
  { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];

const sectoresList = [
  { val: 'digitalizacion', label: 'Digitalización' },
];

const actionsList = [
  { val : 'alta-master',  label: 'Alta de master'}
]

//Según el estado en el que esté el PI se mostrara el label(pendiente) o el slug(hecho);
class AvanceState {
  val: string;
  label: string;
  slug: string;
  estado: string;
}

const nivelesAvanceList: Array<AvanceState> = [
  { val : 'en_proceso', label : 'En proceso',       slug :'Procesado',           estado : 'activo'},
  { val : 'aprobado',   label : 'Aprobar',          slug :'Aprobado',            estado : 'aprobado'},
  { val : 'manifiesto', label : 'Crear manifiesto', slug :'Manifiesto creado',   estado : 'aprobado'},
  { val : 'bagit',      label : 'Crear bagIt',      slug :'BagIt creado',        estado : 'aprobado'},
  { val : 'ingesta',    label : 'Ingestar',         slug :'Ingestado',           estado : 'aprobado'},
  { val : 'cerrado',    label : 'Cerrar',           slug :'Cerrado',             estado : 'cerrado'},
]

const avanceOrderedList = ['en_proceso', 'aprobado', 'manifiesto', 'bagit', 'ingesta', 'cerrado'];

const fileTypeList = [
  { val : 'directory', label: 'Directorio'  },
  { val : 'file',      label: 'Archivo'}
]

const assetTypeList = [
  { val : 'directory', label: 'Directorio'  },
  { val : 'image',      label: 'Imagen'}
]

const relAssetUdsList = [
  { val: '1', label: '1:1', slug: '1:1' },
  { val: '2', label: '2:1', slug: '2:1' },
  { val: '3', label: '3:1', slug: '3:1' },
  { val: '4', label: '4:1', slug: '4:1' }
];

/**
 * Lista de los puntos de montaje disponibles, para elegir al momento de generar un parte de ingesta
 */
const puntoMontajeList = [
  { val: 'ingesta',     label: '/ingesta',     slug: 'ingesta'     },
  // { val: 'master',      label: '/master',      slug: 'master'      },
  // { val: 'derivadas',   label: '/derivada',    slug: 'derivadas'   },
  { val: 'intermedias', label: '/intermedias', slug: 'intermedias' },
];

/**
 * Lista de los tipos de parte de ingesta que se pueden generar
 */
const tipoParteList = [
  { val: 'master',    label: 'Máster',    slug: 'master'    },
  { val: 'derivada',  label: 'Derivada',  slug: 'derivada'  }
];


const optionsLists = {
  default: defaultOptionList,
  nivelesAvance : nivelesAvanceList,
  sectores : sectoresList,
  actions : actionsList,
  fyleTypes : fileTypeList,
  assetTypes : assetTypeList,
  level_of_descripcion: UnidadDescripcionHelper.getOptionList('descriptionLevel'),
  relAssetUds: relAssetUdsList,
  tipoParte: tipoParteList,
  puntoMontaje: puntoMontajeList
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
  const t = list.find((item) => item.val === val);
  return t ? t.estado : val;
}


export class IngestaHelper {
  /**
   * Construye una cadena de caracteres conteniendo los archivos -assets-
   * associados a una determinada UDA
   *
   * Pre: - un ID de unidad de descripción archivística, para la cual queremos
   * obtener la lista de archivos asociados
   * - una lista de asset hooks para escanear buscando asociaciones
   *
   * Post: una cadena de caracteres conteniendo los nombres de los archivos
   * hallados, separados por coma
   */
  static buildFileListFromAssetHook(udaId: string, assetHooks: AssetHook[]): string {
    const files = [];
    assetHooks.filter((assetHook) => assetHook.isVinculado === true && assetHook.itemId === udaId).forEach((assetHook) => {
      files.push(assetHook.assetFilename);
    });
    return files.join(', ');
  }

  static buildAssetHookList(assetList): AssetHook[] {
    let assetHookArray: AssetHook[] = [];

    assetHookArray = assetList.map((token: Asset, index) => {
      return {
        assetId: token._id,
        assetParentId: token.parentAssetId,
        assetType: token.assetType,
        orderBy: (PADDING_ZEROS + (parseInt(index, 10) + 1)).slice(-PADDING_ZEROS_CNT),
        assetName: token.name,
        assetFilename: token.filename,
        assetSlug: token.slug,

        // Por defecto ningún AssetHook está vinculado con ninguna UDS
        isVinculado: false,
      };
    });

    return assetHookArray;
  }

  /**
   * A partir de un array plano de assets, devuelve un árbol de objetos FolderTree,
   * aptos para mostrarse en un mat-tree
   *
   * Pre: array de objetos de tipo Asset
   * Post: árbol de objetos de tipo FolderTree
   */
  static buildTreeData(rawTreeData): FolderTree {
    let treeData: FolderTree = new FolderTree();
    const hashtable = {};
    let arrElem, mappedElem;

    // Mapeo cada nodo del array a un objeto JS, es decir creo una hashtable
    for (let i = 0, len = rawTreeData.length; i < len; i++) {
      arrElem = rawTreeData[i];
      hashtable[arrElem._id] = arrElem;
      hashtable[arrElem._id]['children'] = [];
    }

    for (const id in hashtable) {
      if (hashtable.hasOwnProperty(id)) {
        mappedElem = hashtable[id];
        // Si el elemento no es raíz, añadirlo al array de hijos del padre
        //c onsole.log('for ASSET: parentId: [%s] _id:[%s]  elem[parent]:  [%s] [%s]', mappedElem.isRootFolder, mappedElem._id, mappedElem['parentAssetId'], mappedElem.title, (hashtable[mappedElem['parentAssetId']] && hashtable[mappedElem['parentAssetId']].title))
        if (!mappedElem.isRootFolder) {
          hashtable[mappedElem['parentAssetId']]['children'].push(mappedElem);
        } else {
          // Si estamos en presencia del elemento raíz, convertirlo en objeto de primer nivel
          treeData = mappedElem;
        }
      }
    }
    return treeData;
  }

  /**
   * A partir de un array plano de UDAs, construye un árbol apto para mostrarse
   * en un mat-tree
   *
   * Pre: array de objetos de tipo UnidadDescripcion
   * Post: array de objetos de tipo UnidadDescripcionTree
   */
   static buildUDTreeData(rawTreeData: UnidadDescripcion[], parentId?): UnidadDescripcionTree {
     let treeData: UnidadDescripcionTree = new UnidadDescripcionTree();

     /**
      * Primero hay que convertir el array de UnidadDescripcion en un array de
      * UnidadDescripcionTree, cada uno de los cuales representa un ítem del
      * árbol
      */
     const treeDataSource = rawTreeData.map((token) => {
       const udTreeItem = new UnidadDescripcionTree();
       udTreeItem._id = token._id;
       udTreeItem.title = token.identificador.title;
       udTreeItem.parentId = token.parent.id_parent;
       udTreeItem.level_of_description = token.identificador.level_of_description;
       return udTreeItem;
     }).sort( (a,b) =>
       a.level_of_description === TYPE_UDS ? -1 : 1
     );

    const hashtable = {};
    let arrElem, mappedElem;

    // Mapeo cada nodo del array a un objeto JS, es decir creo una hashtable
    for (let i = 0, len = treeDataSource.length; i < len; i++) {
      arrElem = treeDataSource[i];
      hashtable[arrElem._id] = arrElem;
      hashtable[arrElem._id]['children'] = [];
    }

    for (const id in hashtable) {
      if (hashtable.hasOwnProperty(id)) {
        mappedElem = hashtable[id];
        // Si el elemento no es raíz, añadirlo al array de hijos del padre
        if (mappedElem._id !== parentId) {
          hashtable[mappedElem['parentId']]['children'].push(mappedElem);
        } else {
          // Si estamos en presencia del elemento raíz, convertirlo en objeto de primer nivel
          treeData = mappedElem;
        }
      }
    }

    return treeData;
  }

  static cleanQueryToken(query: IngestProcessQuery): IngestProcessQuery {
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

  static getEstado(type, val) {
    if (!val) {
      return 'no_definido';
    }
    if (!type) {
      return val;
    }
    return getEstado(this.getOptionList(type), val);
  }

  static buildAudit(user: User):Audit{
    let audit = new Audit();
    audit.userId = user._id
    audit.username = user.username
    audit.ts_alta = Date.now();
    return audit;
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

  static getOptionSlug(type, val) {
      if (!val) {
        return 'no_definido';
      }
      if (!type) {
        return val;
      }
      return getSlug(this.getOptionList(type), val);
  }

  static buildDataTablePI(pis: IngestProcess[]): IngestProcessDataTable[] {
    return pis.map((token, index) => {
      let item = new IngestProcessDataTable();
      item._id = token._id;
      item.compNum = token.admin.compNum;
      item.slug = token.slug;
      item.fecha_tx = token.admin.fe_comp_tx;
      item.fecha_ts = token.admin.fe_comp_ts;
      return item;
    });
  }

  static getCodigoReferencia(ud: UnidadDescripcion): string {
    return ud.identificador.reference_code.join(' > ');
  }

  static getDecoratedCodigoReferencia(ud: UnidadDescripcion): string {
    if(!(ud && ud.identificador)) return '';
    return this.getOptionLabel('level_of_descripcion',ud.identificador.level_of_description) + ': ' + ud.identificador.reference_code.join(' > ');
  }

  static parteIngestaSerial(name: string) {
    let serial = new Serial();
    serial.type = 'ingesta';
    serial.name = 'parte'; //parte
    serial.tserial = 'pingesta';
    serial.sector = 'digitalizacion';
    serial.tdoc = 'parte';
    serial.letra = 'X';
    serial.anio = 0;
    serial.mes = 0;
    serial.dia = 0;
    serial.estado = 'activo';
    serial.punto = 0;
    serial.pnumero = 1;
    serial.offset = 400000;
    serial.slug = 'Parte de Ingesta';
    serial.compPrefix = 'PARTE';
    serial.compName = 'P/Ingesta';
    serial.showAnio = false;
    serial.resetDay = false;
    serial.fe_ult = 0;

    return serial;
  }

  static buildStartPI(result : IngestProcess, serial : Serial) : IngestProcess {

          //Object.assign(result.serial, serial);
          result.admin.compNum = serial.offset + serial.pnumero;
          result.admin.compName = serial.compName;
          result.admin.compPrefix = serial.compPrefix;
          result.admin.compId = serial['_id'];
          result.admin.avanceList = [];
          result.admin.avanceList.push(EN_PROCESO);
          result.admin.avance = EN_PROCESO
          result.admin.estado = this.getEstado('nivelesAvance', result.admin.avance);

          result.admin.sector = DIGITALIZACION;
          result.admin.action = ALTA_MASTER;

          delete result.serial;

    return result;
  }

  static updateAvance(pi : IngestProcess, avance : string) : IngestProcess {
    let avanceList = [];
    // recrea avanceList con todas las etapas hasta el nuevo estado de avance.
    let index = avanceOrderedList.indexOf(avance);
    avanceList = avanceOrderedList.filter((t, i) => i <= index);

    pi.admin.avanceList = avanceList;
    pi.admin.estado = this.getEstado('nivelesAvance', avance);
    pi.admin.avance = avance;

    return pi;
  }

  static updateStatistics(pi: IngestProcess): IngestProcess{
    pi.statistics.hasVinculados = true;
    pi.statistics.vinculadosCount = pi.assetHookList.length;
    pi.statistics.udsCount = pi.udaList.reduce((count, uda)=> {
      if(uda.identificador.level_of_description === 'item') count += count;
      return count;
    }, 0);
    pi.statistics.assetsCount = pi.assetList.length;

    return pi;
  }

  static hasProperIngestFolder(ip: IngestProcess): boolean{
    let ok=true;
    if(!(ip.ingestFolder && ip.ingestFolder.path)) return false;
    return ok;
  }

  static hasProperUdaHook(ip: IngestProcess): boolean{
    let ok=true;
    if(!(ip.udaHook && ip.udaHook.udaId)) return false;
    return ok;
  }

  static hasProperAssetHook(ip: IngestProcess): boolean{
    let ok=true;
    if(!(ip.assetHookList && ip.assetHookList.length)) return false;
    if(!(ip.udaList && ip.udaList.length)) return false;
    return ok;
  }



  static buildAssetDataTable(list : Asset[]) : AssetTableData[] {
    return list.map(item => {
      let token = new AssetTableData();
      token.assetType = this.getOptionLabel('assetTypes',item.assetType);
      token.bundlePath = item.bundlePath;
      token.filename = item.filename;
      token.idAsset = item._id;
      token.fileType = this.getOptionLabel('fyleTypes',item.fileType);
      token.isDirectory = item.fileType === 'directory';
      token.isFile = item.fileType === 'file';
      return token;
    })
  }

  static buildIngestFolder(ingestFolder: IngestFolder, content: any): IngestFolder {

    ingestFolder.serverPath = content.scan.serverPath;
    ingestFolder.rootPath = content.scan.rootPath;
    ingestFolder.path = content.scan.rootPath;
    ingestFolder.server = content.scan.server;
    ingestFolder.assetId = null;
    ingestFolder.basename = content.scan.basename;
    ingestFolder.name = content.scan.basename;
    ingestFolder.isBaggit = false;
    ingestFolder.isLocked = false;

    return ingestFolder;
  }
}
