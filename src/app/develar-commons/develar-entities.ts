/***************************
	develar-commons entities
**************************/
import { CardGraph } from '../bookshelf/cardgraph.helper';



/*******************************************
*  Common declarations
*/
const newEntityConfirm = {
  width:  '330px',
  height: '300px',
  hasBackdrop: true,
  backdropClass: 'yellow-backdrop',
  data: {
    caption:'Alta de nueva entidad',
    title: 'Confirme la acción',
    body: 'Se dará de alta: ',
    accept:{
      action: 'accept',
      label: 'Aceptar'
    },
    cancel:{
      action: 'cancel',
      label: 'Cancelar'
    }
  }
};


export class Serial {
    type:string;
    name:string;
    tserial:string;
    sector:string;
    tdoc:string;
    letra:string;
    anio:number;
    mes:number;
    dia:number;
    estado:string;
    punto:number;
    pnumero:number;
    offset:number;
    slug:string;
    compPrefix:string;
    compName:string;
    showAnio:boolean;
    resetDay:boolean;
    fe_ult:number;
}

const LETRAS = ['X', 'Q', 'J', 'A', 'D'];
// X:normal; Q:especiales; J:tercera edad; A:bebes; D:direccion

function letraSerial(peso): string{
  if(!peso || peso > 4 || peso < 0) peso = 0;

  return LETRAS[peso];
}


/*************
  PERMS
*********/
interface Perms {
  owner: Array<string> ;
  persons: Array<string>;
  other: Array<string>;
}



/*******************************************
*  Asset ASSET Asset
*/

const assetTypes: Array<any> = [
    {val: 'no_definido',  label: 'Seleccione opción',  slug:'Seleccione opción' },
    {val: 'jpg',          label: 'jpg',          slug:'Imagen JPG' },
    {val: 'gif',          label: 'gif',          slug:'Imagen GIF' },
    {val: 'png',          label: 'png',          slug:'Imagen PNG' },
    {val: 'pdf',          label: 'pdf',          slug:'Documento PDF' },
    {val: 'word',         label: 'word',         slug:'Documento Word' },
];

export class Asset_old {
	id: string;
	_id: string;
  assetId:      string = "";
  isUploaded:   boolean = true;
  filename:     string = "";
  path:         string = "";
  slug:         string = "";
  description:  string = "";
  server:       string = "";
  originalname: string = "";
  encoding:     string = "";
  mimetype:     string = "";
  size:         string = "";
  upload:       string = "";

  estado:       string = "";
  avance:       string = "";
  tagstr:       string = "";
  taglist:      string = "";
  scope:        string = "";


  files = [];


      /** ID del asset padre (normalmente es una carpeta) */
  parentAssetId: string = '';
      /** Determina el tipo de asset: directory | file */
      assetType: string = '';
      /** El ID de la carpeta raíz (root-folder) */
  rootFolderId: string = '';
  assetRole: string = '';
      /** Nombre de archivo con extensión y asset ID */
  basename: string = '';
      /** Nombre de archivo sin extensión ni asset ID */
  name: string = '';

	constructor(url?: string){
		this.assetId = url;
		this.filename = url;
		this.slug = url;
		this.path = url;
	}
}


export class Asset {
    /** IDENTIFICACIÓN */
    _id: string;

    // _id del asset que representa el parent_folder or null si es rootFolder
    parentAssetId: string = "";

    // _id del asset que representa rootFolder or null si es rootFolder o no es in
    rootFolderId: string = "";

    // path absoluto: /ingesta/2021/03/02/retratos-01/ret-1861/ret-1861-001_5fe351e74b62910febb01bfa.tiff
    path: string = "";

    // Tipo de archivo en el fileSystem: directory | file  | application VER fileTypeOptList
    fileType: string = "file";

    // Tipo de archivo en el fileSystem: directory | file  | application VER assetTypeOptList
    assetType: string = "img";

    // Determina el tipo de asset: directory | file
    assetRole: string = "master";

    // El nombre de archivo en el SO: ret-1861-001_5fe351e74b62910febb01bfa.tiff
    basename: string = ""; //{ type: String, required: false },

    // El nombre original del archivo: ret-1861-001.tiff (coincide con basename si el nombre no fue intervenido)
    filename: string = ""; //{ type: String, required: false },

    // El nombre original del archivo sin la extensión: ret-1861-001.tiff
    name: string = ""; //{ type: String, required: false },

    // Nombre displayAs del asset, default: name
    slug: string = ""; //{ type: String, required: false },

    /** RUTAS */
    // las rutas se registran sin trailing slash
    // Ruta absoluta. Punto de montaje del server NAS.
    //   /ingesta
    serverPath: string = ""; //{ type: String, required: false },

    // Ruta relativa dentro del server, al rootFolder o al file (cuando rootFo), desde serverPath
    //  2021/03/12/ret-01
    rootPath: string = ""; //{ type: String, required: false },

    // Ruta relativa del asset dentro de rootFolder
    bundlePath: string = ""; //{ type: String, required: false },

    /** ESTADO DEL ASSET */
    isUploaded:   boolean = true;
    hasRootFolder: boolean = false;     // true si es parte de un bundle normalizado bajo una rootFolder
    isRootFolder: boolean = false;      // es una carpeta normalizada
    isBaggit:     boolean = false;      // solo tiene sentido para la rootFolder
    estado:       string = "activo";    // estadoOptList
    avance:       string = "";          // avanceOptList
    hasDerivada:  boolean = false;      // ¿Tiene derivada?
    hasThumbnail: boolean = false;      // ¿Tiene miniatura?

    /** META-DATA */
    description: string = "";           // Descripción, comentario
    server:      string = "";           // nombre de servidores registrado // serverOptList
    encoding:    string = "";
    mimetype:    string = "";
    size:        string = "";
    tagstr:      string = "";
    taglist: Array<string> = [];
    fets_alta = 0;

    /** HISTORY */
    files: Array<AssetFile> = [];

    /****
     * deprecated
     * a eliminar una vez revisado todos los usos de asset
     */
    assetId: string = "";
    originalname: string = "";
    scope: Array<string> = [];
    upload: string ='';

    constructor(url?: string){
      this.assetId = url;
      this.filename = url;
      this.basename = url;
      this.slug = url;
      this.path = url;
    }
}





export class ExternalAsset extends Asset {
  id: string;
  _id: string;
  assetId:      string = "";
  isUploaded:   boolean = true;
  filename:     string = "";
  path:         string = "";
  slug:         string = "";
  description:  string = "";
  server:       string = "";
  originalname: string = "";
  encoding:     string = "";
  mimetype:     string = "";
  size:         string = "";
  upload:       string ='';
  files = [];

  constructor(url?: string){
    super(url);
    this.isUploaded = false;
    this.assetId = url;
    this.basename = url;
    this.path = url;
    this.slug = url;
    // estos datos sólo interesan si es un asset de cuerpo-presente
    this.filename = '';
    this.originalname = '';
  }
}

export class AssetFile_old {
	id: string;
	_id: string;
  filename:     string = "";
  path:         string = "";
  originalname: string = "";
  encoding:     string = "";
  mimetype:     string = "";
  size:         string = "";
  destination:  string = "";
  uploadtime:   number = 0;
  upload:       string = "";

	constructor(){
	}
}

export class AssetFile {
    path:         string = '' ; // { type: String, required: false },
    basename:     string = '' ; // { type: String, required: false },
    filename:     string = '' ; // { type: String, required: false },
    name:         string = '' ; // { type: String, required: false },
    encoding:     string = '' ; // { type: String, required: false },
    mimetype:     string = '' ; // { type: String, required: false },
    size:         string = '' ; // { type: String, required: false },
    destination:  string = '' ; // { type: String, required: false },
    fets_alta:    number = 0  ; //   { type: Number, required: false },

    // deprecated
    originalname: string = '' ; // { type: String, required: false },
    upload:       number = 0  ; //       { type: Date, required: false },
    uploadtime:   number = 0  ; //   { type: Number, required: false }
}




class AssetModel {
  constructor(){

  }

  initAsset(data?):Asset {
    data = data || {};
    const card = new Asset('Sub contenido');
    Object.assign(card, data);
    return card;
  }

  confirmSaveMessage(){
    return newEntityConfirm;
  }
  getAssetTypes(){
    return assetTypes;
  }

  initNewExternalAsset(url){
    let asset = new ExternalAsset(url);
    return asset;
  }


}

export const assetModel = new AssetModel();




/*******************************************
*  FOLDER folder Folder
*/

interface AssetInFolder {
  _id: string;
  assetId:      string ;
  basename:     string;
  path:         string ;
  slug:         string ;
  mimetype:     string ;
}

export class Folder {
  id:          string;
  _id:         string;
  name:        string = "";
  slug:        string = "";
  description: string = "";
  estado:      string = "activa";
  tokens:      Array<string> = [];
  persons:     Array<string> = [];
  owner:       string = "";
  perms: Perms = {
    owner:   ['r', 'w', 'x'],
    persons: ['r', 'w'],
    other:   ['r']
  };
  parents:     Array<string> = [];
  tagstr:      string = ""
  taglist:     Array<string> = [];

  assets: Array<AssetInFolder> = [];

  constructor(){

  }
}


function initFolder(name:string, parent:string, perms: Perms, taglist: Array<string>){
  let folder = new Folder();
  folder.name = name || "";
  if(parent) folder.parents.push(parent);
  if(perms) folder.perms = perms;
  if(taglist){
    folder.taglist = taglist;
    folder.tagstr = taglist.join(' ');
  }

  return folder;
}


class FolderModel {
  constructor(){

  }

  initNewFolder(name:string, parent:string, perms: Perms, taglist: Array<string>){
    return initFolder(name, parent, perms, taglist);
  }


}
export const folderModel = new FolderModel();



/*******************************************
*  Google stuff
*/
export class GoogleSearchResponse {
  kind: string;
  url: object;
  queries: object;
  context: object;
  searchInformation: object;
  spelling: object;
  items: Array<any>;

}

export const searchMachines: Array<any> = [
    {val: 'hack',          label: 'Explorar URL',        slug:'Explorar URL' },
    {val: 'community_prg', label: 'Stackoverflow',       slug:'Foros stackoverflow' },
    {val: 'academica',     label: 'Academica',           slug:'Sitios académicos' },
    {val: 'ari',            label: 'ARI',                 slug:'Asuntos regulatorios' },
    {val: 'diarios_nac',    label: 'Diarios Nacionales',  slug:'Diarios nacionales' },
];


/*******************************************
*  TAG tag Tag
*/
interface parentTag {
  id:  string,
  type: string,
  slug: string,
};

export class Tag {
  id:        string;
  _id:       string;
  name:      string = "";
  slug:      string = "";
  type:      string = "";
  target:    string = "activa";
  user:      string = "";
  parents:   Array<parentTag> = [];

  constructor(){

  }
}


