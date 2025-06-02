const fs = require('fs');
const path = require('path');
const asset = require('../models/assetModel');
const dirTree = require('directory-tree');
const { getServer } = require('../services/commons.utils');
const utils = require("../services/commons.utils");

const Asset = asset.getMongooseModel()


const GHOST_FOLDERS = ['thumbnails', 'derivadas']
const ALLOWED_ASSET_EXTENSIONS = ['.jpg', '.jpeg', '.tiff', '.tif', '.png', '.pdf'];
const REMOVE_ASSET_EXTENSIONS = ['.db'];

/**
 * Devuelve un resumen de la carpeta recibida por parámetro; dicha carpeta se calcula a partir de la carpeta pública
 * definida en archivo de configuración {@see config}
 * @param searchRoute
 * @param server
 * @returns {Promise<*>}
 */
exports.getFolderResume = (searchRoute, server) => {

  const serverInfo = getServer(server);


  let filecountByType = [];
  let acumFiles = 0;
  let folderItems = [];

  const routeParse = path.parse(searchRoute);
  const basename = routeParse.name;
  const rootPath = path.join(routeParse.dir, basename);
  const scanPath = path.join(serverInfo.publicPath, serverInfo.serverPath, rootPath);

  if (!fs.existsSync(scanPath)) {
    return {
      publicPath: serverInfo.publicPath,
      serverPath: serverInfo.serverPath,
      rootPath: rootPath,
      searchRoute: searchRoute,
      basename: '',
      server,

      filesCount: 0,
      files: filecountByType,
      folderCount: folderItems.length,
      folders: folderItems
    };
  }

  const fileList = fs.readdirSync(scanPath, { withFileTypes: true });

  for (const file of fileList) {
    if (file.isFile() === true) {
      acumFiles++;
      let extension = path.extname(file.name).substring(1);

      const itemCount = filecountByType.find(item => item.extension === extension);
      if (itemCount) {
        itemCount.count++;
      } else {
        let tempItemCount = { extension, count: 1 };
        filecountByType.push(tempItemCount);
      }

    } else {
      if (!GHOST_FOLDERS.includes(file.name)) {
        folderItems.push(file.name);
      }
    }
  }

  return {
    publicPath: serverInfo.publicPath,
    serverPath: serverInfo.serverPath,
    rootPath,
    searchRoute: searchRoute,
    basename: basename,
    server,

    filesCount: acumFiles,
    files: filecountByType,
    folderCount: folderItems.length,
    folders: folderItems
  };
}

function _buildCommonData(rootFolder, server) {
  const serverInfo = getServer(server);

  return {
    assetRole: 'master',
    serverPath: serverInfo.serverPath,
    rootPath: rootFolder,
    rootFolderId: null,
    estado: 'activo',
    avance: 'pending',
    server: serverInfo.server,
    hasRootFolder: true,
    isUploaded: false,
    isBaggit: false,
  }
}


function getFolderTree(searchRoute, server) {

  const promise = new Promise((resolve, reject) => {
    console.log("\n\n\n\n INIT getFolderTree [searchRoute: %s] [server: %s] \n\n\n\n",searchRoute, server);
    try {
      const serverInfo = getServer(server);
      const routeParse = path.parse(searchRoute);
      const basename = routeParse.name;
      const rootPath = path.join(routeParse.dir, basename);
      const scanPath = path.join(serverInfo.publicPath, serverInfo.serverPath, rootPath);
      const theArray = [];

      console.log("scanPath --> %s", scanPath);
      if (fs.existsSync(scanPath)) {
        const commonData = _buildCommonData(searchRoute, server);
        const theTree = dirTree(scanPath, { attributes: ['type', 'extension']});

        console.log("\n\n\n\n /************/ \n\n\n theTree --> %o \n\n\n",theTree);
        console.log("\n\n\n commonData --> %o \n\n\n",commonData);
        processTree(theTree, theArray, null, commonData, serverInfo.server, serverInfo.publicPath, serverInfo.serverPath);
        console.log("the ARRAY --> %o",theArray)
      }

      // return theArray;
      resolve(theArray);
    } catch(error) {
      console.error("Error producido en getFolderTree --> %o",error);
      // throw new error;
      reject(error);
    }
  })
  return promise;
}

/**
 * Recorre recursivamente el árbol de directorios devuelto por
 * directory-tree, generando un asset para cada elemento según corresponda
 *
 * @param {*} dirNode
 */
function processTree(dirNode, theArray, parent = null, commonData, server, publicPath, serverPath) {
  const tempAsset = _buildAssetFromTreeToken(dirNode, parent, commonData, server, publicPath, serverPath);

  if (dirNode.type === 'directory' || ALLOWED_ASSET_EXTENSIONS.includes(path.extname(dirNode.name))) {
    theArray.push(tempAsset);
  }
  if(dirNode.type !== 'directory' && REMOVE_ASSET_EXTENSIONS.includes(path.extname(dirNode.name))) {

    const relativePath = path.relative(path.join(publicPath, serverPath), dirNode.path);
    const bundlePath = path.relative(commonData.rootPath, relativePath);
    const unlinkPath = path.join('/', publicPath, serverPath, commonData.rootPath, bundlePath);
    fs.unlinkSync(unlinkPath);
    return;
  }

  console.log('dirNode.name[%s][%s]', dirNode.name, !dirNode.name.match(/^[\.]/));

  if (!dirNode.name.match(/^[\.]/)) {
    // Es un directorio
    if (dirNode.type === 'directory') {
      // ¿El directorio tiene hijos? Recorrerlos
      if (dirNode.children) {
        dirNode.children.forEach(item => {
          if (!GHOST_FOLDERS.includes(item.name) && !item.name.match(/^[/.]/)) {
            processTree(item, theArray, tempAsset._id, commonData, server, publicPath, serverPath);

          }
        })
      }
    } else {
      // Es un archivo
      return;
    }
  }
}

function _buildAssetFromTreeToken(token, parentAssetId, commonData, server, publicPath, serverPath) {
  const theAsset = new Asset(commonData);

  let relativePath = path.relative(path.join(publicPath, serverPath), token.path);

  let bundlePath = path.relative(commonData.rootPath, relativePath);

  if (token.type === "directory" && commonData.rootFolderId == null) {
    commonData.rootFolderId = theAsset._id;
    theAsset.rootFolderId = theAsset._id;
    theAsset.isRootFolder = true;
  }

  const assetMimeType = utils.getMimeType(path.join('/', publicPath, serverPath, commonData.rootPath, bundlePath));
  theAsset.assetType = utils.getAssetTypeForMimeType(assetMimeType);

  theAsset.path = path.join('/', relativePath)
  theAsset.bundlePath = bundlePath;

  theAsset.basename = token.name;
  theAsset.filename = token.name;
  theAsset.name = path.basename(token.name, path.extname(token.name))
  theAsset.slug = path.basename(token.name, path.extname(token.name))

  theAsset.fileType = token.type;
  theAsset.size = token.size;
  theAsset.parentAssetId = parentAssetId;

  theAsset.estado = 'alta';
  theAsset.avance = 'emitido';
  theAsset.assetRole = 'master';

  theAsset.server = server;

  return theAsset;
}

exports.getFolderTree = (folder, server) => getFolderTree(folder, server);
