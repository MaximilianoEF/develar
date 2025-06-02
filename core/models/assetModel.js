/**
 * Asset: recurso digital de cuerpo presente
 */

const whoami = "models/assetModel: ";

const mongoose = require('mongoose');

const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const utils = require('../services/commons.utils');
const imageUtils = require('../services/imageutils');
const { mimeTypeOptList } = require('../optlists');

const storageDir = config.storagePath;
const THUMBNAIL_FOLDER = 'thumbnails';
const DERIVADA_FOLDER = 'derivadas';
const BAGGIT_FOLDER = 'data';

const FILETYPE_DIRECTORY = 'directory';
const FILETYPE_FILE = 'file';
const EXT_PDF = '.pdf';
const EXT_JPEG = '.jpg';

const self = this;


// const mimeTypeOptList = [
//   {val: 'no_definido', label: 'Seleccione opción', slug: 'Seleccione opción'},
//   {val: 'image/jpeg', label: 'jpeg', slug: 'Imagen JPEG'},
//   {val: 'image/gif', label: 'gif', slug: 'Imagen GIF'},
//   {val: 'image/png', label: 'png', slug: 'Imagen PNG'},
//   {val: 'image/tiff', label: 'tiff', slug: 'Imagen TIFF'},
//   {val: 'application/pdf', label: 'pdf', slug: 'Documento PDF'},
//   {val: 'word', label: 'word', slug: 'Documento Word'},
// ];

const assetTypeOptList = [
  {val: 'no_definido', label: 'Seleccione opción', slug: 'Seleccione opción'},
  {val: 'directory', label: 'directory', slug: 'Carpeta del SO'},
  {val: 'image', label: 'image', slug: 'Imagen escaneada'},
  {val: 'foto', label: 'foto', slug: 'Foto escaneada'},
  {val: 'pdf', label: 'pdf', slug: 'Archivo PDF'},
  {val: 'office', label: 'office', slug: 'Archivo suite office'},
  {val: 'video', label: 'video', slug: 'video'},
  {val: 'audio', label: 'audio', slug: 'audio'},
  {val: 'manifiesto', label: 'manifiesto', slug: 'Manifiesto'},
  {val: 'json', label: 'json', slug: 'JSON'},
  {val: 'html', label: 'html', slug: 'HTML'},
  {val: 'xml', label: 'xml', slug: 'XML'},
]

const fileTypeOptList = [
  {val: 'no_definido', label: 'Seleccione opción', slug: 'Seleccione opción'},
  {val: 'file', label: 'file', slug: '- Regular file'},
  {val: 'directory', label: 'directory', slug: 'd Folder '},
  {val: 'special', label: 'special file', slug: 'c Special file '},
  {val: 'socket', label: 'socket', slug: 's Socket'},
  {val: 'named', label: 'named pipe', slug: 'p Named pipe'},
  {val: 'block', label: 'block device', slug: 'b Block device'},
];

const estadoOptList = [
  {val: 'no_definido', label: 'Seleccione opción', slug: 'Seleccione opción'},
  {val: 'activo', label: 'Activo', slug: 'Default'},
  {val: 'baja', label: 'Baja', slug: 'Dado de baja, posiblemente garbage_collected'},
  {val: 'virtual', label: 'Virtual', slug: 'Es un placeholder, no tiene un objeto digital asociado'},
  {val: 'orphan', label: 'Huérfano', slug: 'Error, no se encuentra el supuesto objeto digital'},
];

const avanceOptList = [
  {val: 'no_definido', label: 'Seleccione opción', slug: 'Seleccione opción'},
  {val: 'pending', label: 'Pendiente', slug: 'Pendiente de vinculación con el objeto digital'},
  {val: 'uploaded', label: 'Uploaded', slug: 'Vinculado a un objeto digital'},
  {val: 'locked', label: 'Locked', slug: 'Vinculado y marcado como inmutable'},
  {val: 'toerase', label: 'Marcado para borrar', slug: 'Marcado para borrado'},
];

const serverOptList = [
  {val: 'no_definido', label: 'Seleccione opción', slug: 'Seleccione opción'},
  { val: 'master', label: 'Master', uri: '/master', ip: '107.11.12.001', hasPublicAccess: false, isNormalized: true, slug: 'Server de master objects' },
  { val: 'ingesta', label: 'Ingesta', uri: '/ingesta', ip: '107.11.12.002', hasPublicAccess: false, isNormalized: true,slug: 'Punto de montaje visible para Digitalización' },
  { val: 'derivadas', label: 'Derivadas', uri: '/derivadas', ip: '107.11.12.003', hasPublicAccess: false, isNormalized: true, slug: 'Server de versiones derivadas' },
  { val: 'develar', label: 'Development',  uri: '/public/ingesta', ip: '127.0.0.1', hasPublicAccess: true, isNormalized: false, slug: 'Ambiente de desarrollo' },
  { val: 'web', label: 'Web', uri: '/www/assets', ip: '107.11.12.004', hasPublicAccess: true, isNormalized: false, slug: 'Servidor en la DMZ' },
  { val: 'caos', label: 'Servidor Caos', uri: '/xxx/yyy', ip: '107.11.12.005', hasPublicAccess: false, isNormalized: false, slug: 'Servidor(es) legacy con media no identificada' },
];

const assetRoleOptList = [
  {val: 'no_definido', label: 'Seleccione opción', slug: 'Seleccione opción'},
  {val: 'master', label: 'Master'},
  {val: 'derivadas-factory', label: 'Derivadas'},
  {val: 'publico', label: 'Distribución'},
  {val: 'web', label: 'Web'},
  {val: 'general', label: 'Uso no especificado'},

];


/**
 * Creación de un Schema
 * @params
 *  assetId:      link lógico, unívoco dentro de develar, nombre del archivo
 *  path:         link físico, URL del asset
 *  filename:     nombre del objeto, tal como quedó luego de subido al server
 *  slug:         descripción corta
 *  description:  descripción/ comentario/ anotciones del recurso
 *
 *  server:       server
 *  originalname: nombre original
 *  encoding:     encoding
 *  mimetype:     es el mimeType
 *  size:         tamaño
 */


const filedataSch = new mongoose.Schema({
  path: {type: String, required: false},
  basename: {type: String, required: false},
  filename: {type: String, required: false},
  name: {type: String, required: false},

  encoding: {type: String, required: false},
  mimetype: {type: String, required: false},
  size: {type: String, required: false},
  destination: {type: String, required: false},
  fets_alta: {type: Number, required: false},

  // deprecated
  originalname: {type: String, required: false},
  upload: {type: Date, required: false},
  uploadtime: {type: Number, required: false}

})

/**
 * Path ejemplo:
 * /ingesta/2021/03/02/retratos-01/ret-1861/ret-1861-001_5fe351e74b62910febb01bfa.tiff
 *
 * rootFolder
 *    Es la carpeta raiz de un arbol normalizado de assets, posiblemente baggited.
 *
 */
const assetSch = new mongoose.Schema({
  /** IDENTIFICACIÓN **/
  // _id del asset que representa el parent_folder or null si es rootFolder
  parentAssetId: {type: String, required: false, default: null},
  // _id del asset que representa rootFolder or null si es rootFolder o no es in
  rootFolderId: {type: String, required: false, default: null},
  // path relativo al punto de montaje
  // ingesta/2021/03/02/retratos-01/ret-1861/ret-1861-001_5fe351e74b62910febb01bfa.tiff
  path: {type: String, required: false},
  // Tipo de archivo en el fileSystem: directory | file  | application VER fileTypeOptList
  fileType: {type: String, required: false, default: 'file'},
  // Tipo de asset: image/ pdf/ audio/ /video.... VER assetTypeOptList
  assetType: {type: String, required: false, default: 'image'},
  // Solo para assetType === 'file', indica si es master|derivada|etc., assetRoleOptList
  assetRole: {type: String, required: false, default: 'master'},
  // El nombre actual del archivo en el SO: ret-1861-001_5fe351e74b62910febb01bfa.tiff
  basename: {type: String, required: false}, // ant: filename
  // El nombre original del archivo: ret-1861-001.tiff (coincide con basename si el nombre no fue intervenido)
  filename: {type: String, required: false}, // ant: assetId
  // El nombre original del archivo sin la extensión: ret-1861-001
  name: {type: String, required: false},
  // Nombre displayAs del asset, default: name
  slug: {type: String, required: false},

  /** RUTAS */
  // las rutas se registran sin trailing slash
  // Ruta absoluta. Punto de montaje del server NAS.
  // /var/server/nas
  serverPath: {type: String, required: false},

  // Ruta relativa dentro del server, al rootFolder, desde serverPath
  // ingesta/2021/03/12/retratos-01/
  rootPath: {type: String, required: false},

  // Ruta relativa del asset dentro de rootFolder
  bundlePath: {type: String, required: false},

  /** ESTADO DEL ASSET */
  isUploaded: {type: Boolean, required: false, default: false},
  hasRootFolder: {type: Boolean, required: false, default: false}, // Es un bundle normalizado bajo una rootFolder
  isRootFolder: {type: Boolean, required: false, default: false}, // es una carpeta normalizada
  isBaggit: {type: Boolean, required: false, default: false}, // solo tiene sentido para la rootFolder
  estado: {type: String, required: false, default: 'activo'}, // estadoOptList
  avance: {type: String, required: false}, // avanceOptList
  hasDerivada: {type: Boolean, required: false, default: false},
  hasThumbnail: {type: Boolean, required: false, default: false},

  /** META-DATA */
  description: {type: String, required: false}, // Descripción, comentario
  server: {type: String, required: false}, // nombre de servidores registrado // serverOptList
  encoding: {type: String, required: false},
  mimetype: {type: String, required: false},
  size: {type: String, required: false},
  tagstr: {type: String, required: false},
  taglist: {type: Array, required: false},
  fets_alta: {type: Number, required: false},

  /** HISTORY // TODO: ver conveniencia de moverlo a una nueva colección */
  files: [filedataSch],

  /****
   * deprecated
   * a eliminar una vez revisado todos los usos de asset
   */
  assetId: {type: String, required: false},
  originalname: {type: String, required: false},
  scope: {type: Array, required: false},
  upload: {type: Date, required: false},


});

assetSch.pre('save', function (next) {
  return next();
});


/**
 * El Modelo es el objeto constructor de instancias concretas
 * se obtiene a partir del Schema
 * @param String: nombre del Modelo
 * @param Schema: Schema a partir del cual crear el modelo
 * @param String: nombre a asignar a las colecciones de modelos (en plural)
 */
const Record = mongoose.model('Asset', assetSch, 'assets');

exports.assetSch = assetSch;

/******/
exports.getAssetInstance = () => {
  return new Record();
}

exports.getMongooseModel = () => {
  return Record;
}

exports.assetExists = (serverPath, rootPath, bundlePath) => _assetExists(serverPath, rootPath, bundlePath);
exports.derivadaFolderPath = (serverPath, rootPath, bundlePath, fileType) => _derivadaFolderPath(serverPath, rootPath, bundlePath, fileType);
exports.buildDerivadaName = (rootPath, assetPath, fileType) => _buildDerivadaName(rootPath, assetPath, fileType);
/******/

////////////////////////////////    API    ////////////////////////////////

/**
 * Retrieve all records
 * @param cb
 * @param errcb
 */
exports.findAll = function (errcb, cb) {
  Record.find().lean().exec(function (err, entities) {
    if (err) {
      errcb(err);
    } else {
      cb(entities);
    }
  });
};

/**
 * Retrieve records from query /search/?name=something
 * @param cb
 * @param errcb
 */
exports.findByQuery = function (query, errcb, cb) {
  let regexQuery = {"slug": {"$regex": query.slug, "$options": "i"}};
  Record.find(regexQuery).lean().exec(function (err, entities) {
    if (err) {
      console.log('[%s] findByQuery ERROR: [%s]', whoami, err)
      errcb(err);
    } else {
      cb(entities);
    }
  });
};

/**
 * findPathById: usado por downloadRoutes, busca el asset y devuelve el absolute path para
 * hacer un redirect y descargar el objeto
 * @param id
 * @param cb
 * @param errcb
 */
exports.findPathById = function (id, errcb, cb) {
  Record.findById(id, function (err, entity) {
    if (err) {
      console.log('[%s] findPathByID ERROR() argument [%s]', whoami, arguments.length);
      err.itsme = whoami;
      errcb(err);

    } else {
      if (entity) {
        cb(entity.path);
      }
    }
  });

};


/**
 * Busca y redireccion a una determinada ruta de descarga de un asset.
 * Si el asset, además, es una imagen en formato TIFF, la convierte al vuelo en JPEG
 * y retorna la ruta hacia el archivo convertido.
 *
 * @param id
 * @param errorCallback
 * @param successCallback
 */
exports.findDownloadRouteById = async function (id, errorCallback, successCallback) {
  try {
    /**
     * AtoM requiere que las URLs mantengan una extensión para poder procesarlas al importar datos desde un CSV
     * Si en el ID me mandan el ".jpg", lo extraigo y me quedo con el MongoID
     */
    if (id.endsWith('.jpg')) {
      id = id.substr(0, id.length - 4);
    }

    const asset = await Record.findById(id).lean().exec();
    const masterPath = _buildMasterPath(asset);

    let redirectPath;

    /** Si el asset es una imagen, ver de que tipo es */
    if (asset.fileType !== FILETYPE_DIRECTORY) {
      const mimeType = utils.getMimeType(masterPath);

      /** Si es TIFF, hay que convertirla a JPEG */
      if (isTIFF(mimeType)) {
        const convertedImagePath = imageUtils.convertToJPEG(masterPath);

        if (convertedImagePath) {
          redirectPath = _buildConvertedMasterRedirectPath(convertedImagePath);
        } else {
          redirectPath = _buildMasterRedirectPath(asset);
        }
      } else {
        redirectPath = _buildMasterRedirectPath(asset);
      }
    }

    successCallback(redirectPath);
  } catch(error) {
    errorCallback(error);
  }
}



exports.asyncFindDownloadRouteById = async function(id) {
  try {
    const asset = await Record.findById(id).lean().exec();
    const masterPath = _buildMasterPath(asset);

    let redirectPath = '';

    if (asset.fileType !== FILETYPE_DIRECTORY) {
      const mimeType = utils.getMimeType(masterPath);

      // Conversión a JPEG en caso de que se trate de un master TIFF
      if (isTIFF(mimeType)) {
        const convertedImagePath = imageUtils.convertToJPEG(masterPath);

        if (convertedImagePath) {
          redirectPath = _buildConvertedMasterRedirectPath(convertedImagePath);
        } else {
          redirectPath = _buildMasterRedirectPath(asset);
        }
      } else {
        redirectPath = _buildMasterRedirectPath(asset);
      }
    }

    return redirectPath;

  } catch(error) {
    console.error(`asyncFindDownloadRouteById(${id}) error: `, error);
  }
}



/**
 * Verifica si existe la derivada para tal assetId
 * @param id ID del Asset que se quiere averiguar su derivada
 * @param errcb
 * @param  sccb
 */
exports.pdfExist = async (id, errcb, scb) => {
  try {
    const entity = await Record.findById(id).lean().exec();

    if(entity) {
      if(entity.assetType === FILETYPE_DIRECTORY) {
        const hasRedirectPath = _buildDerivadaRedirectPath(entity);
        if(hasRedirectPath) {
          scb(true);
        } else {
          scb(false);
        }
      } else {
        scb(false);
      }
    }
  } catch(error) {
    errcb(error);
  }
}

/**
 * Busca y redirecciona hacia la ruta correspodiente a la miniatura para un determinado asset
 *
 * @param id El ID del Asset cuyo thumbnail se quiere descargar
 * @param errorCallback
 * @param successCallback
 */
exports.findThumbnailDownloadRouteById = async function (id, errorCallback, successCallback) {
  try {
    const entity = await Record.findById(id);

    let redirectPath = _buildThumbnailRedirectPath(entity);

    successCallback(redirectPath);
  } catch(error) {
    errorCallback(error);
  }
}

/**
 * Busca y redirecciona hacia la ruta correspodiente a la derivada para un determinado asset
 *
 * @param id El ID del Asset cuya derivada se quiere descargar
 * @param errorCallback Callback a invocarse en caso de producirse error
 * @param successCallback Callback a invocarse en caso de resolución satisfactoria
 */
exports.findDerivadaDownloadRouteById = async function (id, errorCallback, successCallback) {
  try {
    const entity = await Record.findById(id);

    let redirectPath = _buildDerivadaRedirectPath(entity);

    if (!redirectPath) {
      redirectPath = _buildThumbnailRedirectPath(entity);
    }

    successCallback(redirectPath);
  } catch(error) {
    errorCallback(error);
  }
}

/**
 * find by ID
 * @param id
 * @param cb
 * @param errcb
 */
exports.findById = function (id, errcb, cb) {

  Record.findById(id, function (err, entity) {
    if (err) {
      console.log('[%s]findByID ERROR() argument [%s]', whoami, arguments.length);
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entity);
    }
  });

};


/**
 * Upddate a new record
 * @param id
 * @param record
 * @param cb
 * @param errcb
 */
exports.update = function (id, record, errcb, cb) {
  Record.findByIdAndUpdate(id, record, function (err, entity) {
    if (err) {
      console.log('[%s] validation error as validate() argument ')
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entity);
    }
  });

};

exports.createAssetFromUpload = function (file, errcb, cb) {
  const assetMimeType = utils.getMimeType(path.join('/', config.publicPath, file.serverPath, file.rootPath, file.bundlePath));
  const assetType = utils.getAssetTypeForMimeType(assetMimeType);

  let record = {
    parentAssetId: null,
    rootFolderId: null,
    path: file.path,
    serverPath: file.serverPath || '/',
    rootPath: file.rootPath,
    bundlePath: file.bundlePath,

    fileType: file.fileType,

    assetType,
    assetRole: 'general',

    basename: file.basename,
    filename: file.filename,
    name: file.name,
    slug: file.name,


    isUploaded: true,
    isRootFolder: false,
    isBaggit: false,

    estado: 'activo',
    avance: 'uploaded',

    description: '',
    server: 'develar',

    //encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size,
    upload: file.upload,

    files: [file],
    assetId: file.filename,
    originalname: file.filename,

  }

  Record.create(record, function (err, entity) {
    if (err) {
      console.log('[%s]createFromUpload result ', whoami)
      err.itsme = whoami + 'asset.createAssetFromUpload: Error';
      errcb(err);

    } else {
      cb(entity);
    }
  });

}

/**
 * Sign up a new record
 * @param record
 * @param cb
 * @param errcb
 */
exports.create = function (record, errcb, cb) {
  delete record._id;
  console.log('asset model create [%s]', record)

  Record.create(record, function (err, entity) {
    if (err) {
      console.log('[%s] validation error as validate() argument ', whoami)
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entity);
    }
  });

};

exports.createMany = function (records, errorCallback, successCallback) {
  if(records && records.length){
    records = records.map(tk => {
      tk._id = mongoose.Types.ObjectId(tk._id);
      return tk;
    })
  }

  console.log("Asset createMany --> %o",records);
  // 2021-10-22 Usar record.collection.insertMany que es más eficiente
  //Record.insertMany(records, {ordered: false, lean: true}, function (error, result) {
  Record.collection.insertMany(records, {}, (error, result) => {
    if (error) {
      errorCallback(error);
    } else {
      //console.log("result --> %o",result)
      if (result.acknowledged) {
        successCallback(result.insertedIds);
      } else {
        console.error('Record.collection.insertMany FAILED');
        errorCallback(result);
      }
    }
  });
}


/**
 * Delete asset
 * @param id
 * @param cb
 * @param errcb
 */
exports.delete = function (id, errcb, cb) {

  Record.deleteOne({_id: id}, function (err, entity) {
    if (err) {
      console.log('[%s] Deleting error as validate() argument', whoami)
      err.itsme = whoami;
      errcb(err);

    } else {
      cb(entity)
    }
  });

};

exports.deleteMany = function (records, errorCallback, successCallback) {
  /** Hace falta parsear el array de registros a eliminar; nos quedamos con el _id */
  let idsToDelete = [];
  if (records && records.length > 0) {
    records.forEach(item => idsToDelete.push(item._id));
  }

  const filter = {
    '_id': {
      '$in': idsToDelete
    }
  };

  Record.deleteMany(filter, function (error, entities) {
    if (error) {
      errorCallback(error);
    } else {
      successCallback(entities);
    }
  });
}


////////////////////////////////    CAPA DE SERVICIOS    ////////////////////////////////
function isTIFF(mimeType) {
  const found = mimeTypeOptList.find(item => item.val === mimeType);

  if (found) {
    return found.extension === 'tiff';
  }

  return false;
}

/**
 *
 */
function _buildConvertedMasterRedirectPath(convertedPath) {
  return path.relative(config.publicPath, convertedPath);
}

/**
 * Construye y retorna la ruta (redirectPath) para un archivo maestro
 *
 * @param asset   El objeto asset para calcular su ruta maestra
 * @private
 */
function _buildMasterRedirectPath(asset) {
  const bundlePath = asset.bundlePath;
  let redirectPath;

  if (_assetExists(asset.serverPath, asset.rootPath, bundlePath)) {
    redirectPath = path.join('/', asset.serverPath, asset.rootPath, asset.bundlePath);
  } else {
    redirectPath = path.join('/', 'assets', 'img', 'icono-carpeta.jpg');
  }

  return redirectPath;
}



/**
 * Construye y retorna la ruta (redirectPath) para un archivo maestro
 *
 * @param asset   El objeto asset para calcular su ruta maestra
 * @private
 */
function _buildMasterPath(asset) {
  const bundlePath = asset.bundlePath;
  let absolutePath = '';

  if (_assetExists(asset.serverPath, asset.rootPath, bundlePath)) {
    absolutePath = path.join('/', config.publicPath, asset.serverPath, asset.rootPath, asset.bundlePath);
  }

  return absolutePath;
}



/**
 * Construye y retorna la ruta (redirectPath) para una thumbnail; si el archivo físico del thumbnail
 * no existe, devuelve una imagen por defecto
 *
 * @param asset El objeto asset para calcular su ruta thumbnail
 * @private
 */
function _buildThumbnailRedirectPath(asset) {
  const bundleThumbnailPath = _bundleThumbnailPath(asset.bundlePath, asset.name, asset.fileType);

  let redirectPath;

  if (_assetExists(asset.serverPath, asset.rootPath, bundleThumbnailPath)) {
    redirectPath = path.join('/', asset.serverPath, asset.rootPath, bundleThumbnailPath);
  } else {
    redirectPath = path.join('/', 'assets', 'img', 'icono-carpeta.jpg');
  }

  return redirectPath;
}

/**
 * Construye y retorna la ruta (redirectPath) para una derivada
 *
 * @param asset El objeto asset para calcular su ruta derivada
 * @private
 */
function _buildDerivadaRedirectPath(asset) {
  const bundleDerivadaPath = _bundleDerivadaPath(asset.bundlePath, asset.name, asset.fileType, asset.isBaggit);
  let redirectPath = '';

  if (_assetExists(asset.serverPath, asset.rootPath, bundleDerivadaPath)) {
    redirectPath = path.join('/', asset.serverPath, asset.rootPath, bundleDerivadaPath);
  }

  return redirectPath;
}

/**
 * Retorna el bundlePath para la thumbnail de un asset
 *
 * @param bundlePath      bundle-path original del asset
 * @param name            nombre del asset sin el assetId y sin la extensión
 * @param fileType
 * @private
 */
function _bundleThumbnailPath(bundlePath, name, fileType = null) {
  const bundleParsed = path.parse(bundlePath);
  let bundleThumbnailPath;
  bundleThumbnailPath = path.join(bundleParsed.dir, THUMBNAIL_FOLDER, name + EXT_JPEG);
  return bundleThumbnailPath;
}

/**
 * Retorna el bundlePath para la derivada de un asset
 *
 * @param bundlePath      bundle-path original del asset
 * @param name            nombre del asset sin el assetId y sin la extensión
 * @param fileType        el tipo de asset (file / directory)
 * @private
 */
function _bundleDerivadaPath(bundlePath, name, fileType, isBaggit = false) {
  const bundleParsed = path.parse(bundlePath);
  let bundleDerivadaPath;

  if (fileType === FILETYPE_DIRECTORY) {
    if (isBaggit) {
      bundleDerivadaPath = path.join(bundlePath, BAGGIT_FOLDER, DERIVADA_FOLDER, name + EXT_PDF);
    } else {
      bundleDerivadaPath = path.join(bundlePath, DERIVADA_FOLDER, name + EXT_PDF);
    }
  } else {
    bundleDerivadaPath = path.join(bundleParsed.dir, DERIVADA_FOLDER, name + EXT_JPEG);
  }

  return bundleDerivadaPath;
}


/**
 * Retorna el path para la carpeta de derivadas de un asset
 *
 * @param serverPath      carpeta del servidor
 * @param rootPath
 * @param bundlePath      bundle-path original del asset
 * @param fileType        file-type del asset (file/directory)
 * @private
 */
function _derivadaFolderPath(serverPath, rootPath, bundlePath, fileType) {
  const bundleParsed = path.parse(bundlePath);
  let derivadaFolderPath;

  if (fileType === FILETYPE_DIRECTORY) {
    derivadaFolderPath = path.join(config.publicPath, serverPath, rootPath, bundlePath, DERIVADA_FOLDER);
  } else {
    derivadaFolderPath = path.join(config.publicPath, serverPath, rootPath, bundleParsed.dir, DERIVADA_FOLDER);
  }

  return derivadaFolderPath;
}


/**
 * Verifica que un asset, cuya ruta se construye al estándar develar, exista
 *
 * @param serverPath
 * @param rootPath
 * @param bundlePath
 * @return {boolean}
 * @private
 */
function _assetExists(serverPath, rootPath, bundlePath) {
  const assetPath = path.join(config.publicPath, serverPath, rootPath, bundlePath);
  return fs.existsSync(assetPath);
}

/**
 * Calcula y devuelve el nombre que la derivada deberá tener
 *
 * @param rootPath
 * @param assetPath
 * @param fileType
 * @private
 */
function _buildDerivadaName(rootPath, assetPath, fileType) {
  const parsed = path.parse(assetPath);
  let derivadaName;

  if (fileType === FILETYPE_DIRECTORY) {
    derivadaName = parsed.base;
  } else {
    derivadaName = parsed.name;
  }

  return derivadaName;
}
