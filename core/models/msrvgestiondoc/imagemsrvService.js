/**
 * Microservicios para tratamiento de imágenes
 */
const whoami = 'Microservice: imagemsrvService.js'
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Bull = require('bull');

const dirTree = require('directory-tree');

const config = require('../../config/config');

const utils = require('../../services/commons.utils');
const { mimeTypeOptList } = require('../../optlists');

const ingestProcessRecord = require('../ingestProcessModel').getRecord();
const assetRecord = require('../assetModel').getMongooseModel();
const { buildDerivadaName, derivadaFolderPath, assetExists } = require('../assetModel');

/** Los tipos MIME permitidos, es decir para los que vamos a generar la miniatura */
const MIMETYPES_ALLOWED = [
  'image/jpeg',
  'image/tiff',
  'image/png',
  'application/pdf',
  'inode/directory'
];

const THUMBNAIL_DERIVADA_FILE_PERMISSIONS = 666;

const FINAL_COUNT = 999999;

const DERIVADA_OK_STATUS = 'Derivada OK';
const DERIVADA_ERROR_STATUS = 'Derivada ERROR';


const FILETYPE_DIRECTORY = 'directory';

const THUMBNAIL_FOLDER = 'thumbnails';
const DERIVADA_FOLDER = 'derivadas';

const TYPE_DERIVADA = 'derivadas';
const TYPE_THUMBNAIL = 'thumbnails';


const OK_STATUS = 'imgServiceOK';
const ERROR_STATUS = 'imgServiceERROR::';

const GHOST_FOLDERS = [ THUMBNAIL_FOLDER, DERIVADA_FOLDER ]
const MAGIC_OPTION_PDF = [ '-background', 'white', '-flatten' ];


const MOGRIFY_OPTION_SIZE_DERIVADA =  ['-path', 'derivadas',  '-thumbnail', 'x900', '-format',  'jpg', '-monitor'];
const MOGRIFY_OPTION_SIZE_THUMBNAIL = ['-path', 'thumbnails', '-thumbnail', 'x200', '-format',  'jpg', '-monitor'];

const MOGRIFY_OPTION_THUMBNAIL =     [...MOGRIFY_OPTION_SIZE_THUMBNAIL];
const MOGRIFY_OPTION_THUMBNAIL_PDF = [...MOGRIFY_OPTION_SIZE_THUMBNAIL, ...MAGIC_OPTION_PDF];
const MOGRIFY_OPTION_DERIVADA =      [...MOGRIFY_OPTION_SIZE_DERIVADA];
const MOGRIFY_OPTION_DERIVADA_PDF =  [...MOGRIFY_OPTION_SIZE_DERIVADA, ...MAGIC_OPTION_PDF];



const CONVERT_OPTION_SIZE_DERIVADA =  ['-thumbnail', 'x900', '-monitor'];
const CONVERT_OPTION_SIZE_THUMBNAIL = ['-thumbnail', 'x200', '-monitor'];

const CONVERT_OPTION_THUMBNAIL = [...CONVERT_OPTION_SIZE_THUMBNAIL];
const CONVERT_OPTION_THUMBNAIL_PDF = [...CONVERT_OPTION_SIZE_THUMBNAIL, ...MAGIC_OPTION_PDF];

const CONVERT_OPTION_DERIVADA = [...CONVERT_OPTION_SIZE_DERIVADA];
const CONVERT_OPTION_DERIVADA_PDF = [...CONVERT_OPTION_SIZE_DERIVADA, ...MAGIC_OPTION_PDF];

//////////////////////// COLAS DE MENSAJES //////////////////
const MESSAGE_QUEUE = 'message:bagit';
const DERIVADA_MESSAGE_QUEUE = 'message:derivada';
const THUMBNAIL_MESSAGE_QUEUE = 'message:thumbnail';
const PDF_MESSAGE_QUEUE = 'message:pdf';
//////////////////////////////    API    //////////////////////////////
exports.buildThumbnails = pushThumbnailsTask;
exports.buildDerivadas = pushDerivadaTask;
exports.buildDerivadaAsset = pushDerivadaAssetTask;

//////////////////////////////    INICIALIZACIÓN DE COLAS    //////////////////////////////
const THUMBNAIL_QUEUE_LABEL = 'pingesta:ingestfolder:thumbnail';
const DERIVADA_QUEUE_LABEL = 'pingesta:ingestfolder:derivada';
const DERIVADA_ASSET_QUEUE_LABEL = 'pingesta:asset:derivada';
const thumbnailQueue = new Bull(THUMBNAIL_QUEUE_LABEL);
const derivadaQueue = new Bull(DERIVADA_QUEUE_LABEL);
const derivadaAssetQueue = new Bull(DERIVADA_ASSET_QUEUE_LABEL);

addListenerToQueue(thumbnailQueue);
addListenerToQueue(derivadaQueue);
addListenerToQueue(derivadaAssetQueue);

//////////////////////////////    CONSUMIDOR (procesa tareas)    //////////////////////////////
thumbnailWorker(thumbnailQueue, async (job) => {

  const thumbnailPromise = new Promise(async (resolve, reject) => {

    let messageProducer = new Bull(THUMBNAIL_MESSAGE_QUEUE);
    for (const status of ['active', 'completed', 'delayed', 'failed', 'wait']) {
      messageProducer.clean(100, status);
    }
    let task = job.data;
    let progressCount = 0;

    let job_status = {
      progress: 0,
      status: 'Inicia ejecución',
      queue: THUMBNAIL_QUEUE_LABEL,
      identifier: task.entityId,
      jobid: job.id
    };


    const server = utils.getServer(task.ingestFolder.server);
    let targetFolder = path.join(server.publicPath, task.ingestFolder.serverPath, task.ingestFolder.path);

    messageProducer.add( {...job_status} );
    job.progress(job_status);

    // Al finalizar _procesar Directorio, es un arreglo de promesas, cada una correspondiente a un proceso
    // generado mediante la sentencia s p awn; el objetivo es que cuando todas se resuelvan, dar por finalizado
    // (done) el proceso en Bull
    const processArray = [];

    // Escaneamos mediante dirTree a la targetFolder
    console.log('======== 117: thumbnailWorker =============')
    console.log(targetFolder);
    console.log('========  =============')
    const targetfolderDirTree = dirTree(targetFolder, { attributes: ['type', 'extension']});
    // Itera el árbol de directorios y va generando derivadas cuando corresponda
    _procesarDirectorio(targetfolderDirTree, TYPE_THUMBNAIL, processArray, job, progressCount, job_status, messageProducer);

    try {
      const results = await Promise.all(processArray);
      if (results) {
        console.log("\n\n\n/*********************************/")
        console.log("FINALIZO thumbnail")
        console.log("Results --> %o", results);
        console.log("\n\n\n/*********************************/")
        job_status.progress = FINAL_COUNT;
        job_status.status = 'Finish';
        messageProducer.add({ ...job_status })
        job.progress(job_status)
        resolve(task.status)
      }
    } catch (error) {
      console.log("\n\n\n/*********************************/")
      console.log("FINALIZO thumbnail ERROR")
      console.log("\n\n\n/*********************************/")
      job_status.progress = FINAL_COUNT;
      job_status.status = 'Finish ERROR THUMBNAIL';
      messageProducer.add({ ...job_status })
      job.progress(job_status);
      resolve(task.status)
    }
  })

  return thumbnailPromise;
});

derivadaWorker(derivadaQueue, async (job) => {

  const derivadaPromise = new Promise( (resolve, reject) => {
    let messageProducer = new Bull(DERIVADA_MESSAGE_QUEUE);
    for (const status of ['active', 'completed', 'delayed', 'failed', 'wait']) {
      messageProducer.clean(100, status);
    }
    let task = job.data;
    let progressCount = 0;

    let job_status = {
      progress: 0,
      status: '',
      queue: DERIVADA_QUEUE_LABEL,
      identifier: task.entityId,
      jobid: job.id
    };


    const server = utils.getServer(task.ingestFolder.server);
    let targetFolder = path.join(server.publicPath, task.ingestFolder.serverPath, task.ingestFolder.path);
    messageProducer.add( {...job_status} );
    job.progress(job_status);

    const processArray = [];

    // Escaneamos mediante dirTree a la targetFolder
    const targetfolderDirTree = dirTree(targetFolder, { attributes: ['type', 'extension']});
    // Itera el árbol de directorios y va generando derivadas cuando corresponda
    _procesarDirectorio(targetfolderDirTree, TYPE_DERIVADA, processArray, job, progressCount, job_status, messageProducer);

      Promise.all(processArray).then(results => {
        if (results && results.length) {
          console.log("\n\n\n/*********************************/");
          console.log("FINALIZO DERIVADA");
          console.log("results --> %o",results);
          console.log("\n\n\n/*********************************/");
          job_status.progress = FINAL_COUNT;
          job_status.status = 'Finish';
          messageProducer.add({ ...job_status })
          job.progress(job_status)
          resolve(task.status)

        }
      }).catch(error => {
          console.log("\n\n\n/*********************************/")
          console.log("FINALIZO Derivada ERROR")
          console.log("\n\n\n/*********************************/")
          job_status.progress = FINAL_COUNT;
          job_status.status = 'Finish ERROR DERIVADA';
          messageProducer.add({ ...job_status })
          job.progress(job_status)
          resolve(task.status)
      })
  })
  return derivadaPromise;

});


derivadaAssetWorker(derivadaAssetQueue, (job, done) => {
  const task = job.data;
  let sourcePath = path.join(config.publicPath, task.asset.serverPath, task.asset.rootPath, task.asset.bundlePath);
  let derivadaFolder = derivadaFolderPath(task.asset.serverPath, task.asset.rootPath, task.asset.bundlePath, task.asset.fileType);


  if (!assetExists(task.asset.serverPath, task.asset.rootPath, task.asset.bundlePath)) {
    task.status = DERIVADA_ERROR_STATUS + ': No existe el asset en el filesystem';
    done(null, task.status);
  }


  const mimeType = utils.getMimeType(sourcePath);
  const isMimeTypeAllowed = _verifyIsAllowedMimetype(mimeType);


  if (isMimeTypeAllowed) {

    try {
      // Aloja el resultado de ejecución de s.p.awn
      let derivada;
      // Tamaño de derivada personalizado
      let dimensiones = _recrearDimensionesImagen(task.options);

      // Verifica la existencia de la carpeta para alojar las derivadas; si no existe, la crea
      _crearDirectorioSiNoExiste(derivadaFolder);

      if (task.asset.fileType === 'directory') {
        // 1.0.0. procesa una carpeta
        const derivadaName = buildDerivadaName(task.asset.rootPath, task.asset.path, task.asset.fileType);
        //
        if (_esCarpetaContenedora(task.options)) {
          // 1.1.0. procesa una carpeta para generar un pdf a partir del contenido

          /** Cola de mensajería PDF */
          let messageProducer = new Bull(PDF_MESSAGE_QUEUE);
          for (const status of ['active', 'completed', 'delayed', 'failed', 'wait']) {
            messageProducer.clean(100, status);
          }
          let progress = 0;

          let progress_status = {
            progress: 0,
            status: '',
            queue: THUMBNAIL_QUEUE_LABEL,
            identifier: task.entityId,
            jobid: job.id
          };

          messageProducer.add( {...progress_status} );
          job.progress(progress_status);

          const destino = _recrearRutaDestino(derivadaFolder, derivadaName, '.pdf');
          // crea un pdf a partir de un lote de archivos presentes en la carpeta
          derivada = spawn('convert', [path.join(derivadaFolder, '*.{jpeg,jpg,png,gif,tif,tiff}'), destino]);

          derivada.on('close', (code) => {
            console.log("\n\n\n DERIVADA ON CLOSE CODE --> %s",code)
            if (code) {
              task.status = DERIVADA_ERROR_STATUS + code;

            } else {
              task.status = DERIVADA_OK_STATUS;
            }
            progress_status.progress = FINAL_COUNT;
            progress_status.status = task.status;

            messageProducer.add({ ...progress_status })
            job.progress(progress_status)

            done(null, task.status);
          });
        } else {
          // 1.2.0. procesa una carpeta para convertir cada objeto encontrado
          /*
           * Si no se trata de una carpeta contenedora, entonces hay que generar las derivadas para cada imagen o
           * PDF dentro de la carpeta fuente
           */
          fs.readdir(sourcePath, function (err, fileList) {
            if (err) {
              task.status = DERIVADA_ERROR_STATUS + ': iterando source-folder';
              done(null, task.status);
            } else {
              const derivadaProcesses = [];

              for (let k = 0; k < fileList.length; k++) {
                derivadaProcesses.push(
                  new Promise(function (resolve, reject) {
                    // crea un thumbnail 
                    const theProcess = spawn('convert', [...MAGIC_OPTION_PDF, '-thumbnail', dimensiones, '-monitor', path.join(sourcePath, fileList[k]), path.join(derivadaFolder, _getName(fileList[k])) + '.jpg'])

                    theProcess.on('close', (code) => {
                      resolve(code);
                    });

                    theProcess.on('error', (err) => {
                      reject(err);
                    });
                  })
                );
              }

              Promise.all(derivadaProcesses)
                .then(result => {
                  task.status = DERIVADA_OK_STATUS + ': ' + result;
                  done(null, task.status);
                })
                .catch(error => {
                  console.error(error);
                });
            }
          });
        }
      } else {
        /* Construcción de la derivada para un archivo puntual */
        let derivadaName = buildDerivadaName(task.asset.rootPath, task.asset.path, task.asset.fileType);
        const destino = _recrearRutaDestino(derivadaFolder, derivadaName, '.jpg');

        /** Para extraer la portada de un PDF es otro comando */
        if (mimeType === 'application/pdf') {
          derivada = spawn('convert', [...MAGIC_OPTION_PDF, '-thumbnail', dimensiones, '-monitor', sourcePath + '[0]', destino]);
        } else {
          derivada = spawn('convert', ['-thumbnail', dimensiones, sourcePath, destino]);
        }
        /** Ejecutado al capturar salida estándar producida por el job */
        derivada.stdout.on('data', (data) => { });
        /** Ejecutado al capturar error estándar producido por el job */
        derivada.stderr.on('data', (data) => { });
        derivada.on('error', (error) => console.error('derivada-asset error: ', error));

        /** Ejecutado al finalizar el job */
        derivada.on('close', (code) => {
          if (code) {
            task.status = DERIVADA_ERROR_STATUS + code;
          } else {
            task.status = DERIVADA_OK_STATUS;
          }

          done(null, task.status);
        });
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  }
});

//////////////////////////////    FUNCIONES HELPER    //////////////////////////////
function addListenerToQueue(queue) {
  queue.on('global:completed', (job, result) => {
  });
}

function addTaskToQueue(queue, task) {
  queue.add(task)
}

function thumbnailWorker(queue, processFn) {
  queue.process(async (job) => {
    const result = await processFn(job);
    //c onsole.log('1.1.[%s] Thumbnail process task async done! [%s]==[%s]',job.id, result, job.data.status);
    return result;
  });
}

function derivadaWorker(queue, processFn) {
  queue.process(async (job) => {
    const result = await processFn(job);
    // c onsole.log('1.2.[%s] Derivada process task async done! [%s]==[%s]',job.id, result, job.data.status);
    return result;
  });
}

function derivadaAssetWorker(queue, processFn) {
  queue.process(async (job, done) => {
    await processFn(job, done)
  });
}


//////////////////////////////    PRODUCTOR    //////////////////////////////
function pushThumbnailsTask(task, errcb, cb) {
  const ingestProcessId = task.entityId;

  if (!ingestProcessId) {
    errcb('error', 'No tengo ID de P.I.');
    return;
  }

  ingestProcessRecord.findById(ingestProcessId)
    .exec()
    .then(pi => {
      if (pi) {
        task.status = 'Tarea iniciada';
        task.ingestFolder = pi.ingestFolder;
        addTaskToQueue(thumbnailQueue, task);
        cb(task);
      } else {
        errcb('error', 'No encuentro el P.I.');
      }
    })
    .catch((error) => console.error(error));
}

function pushDerivadaTask(task, errcb, cb) {
  const ingestProcessId = task.entityId;

  if (!ingestProcessId) {
    errcb('error', 'No tengo ID de P.I.');
    return;
  }

  ingestProcessRecord.findById(ingestProcessId)
    .exec()
    .then(pi => {
      if (pi) {
        task.status = 'Tarea iniciada';
        task.ingestFolder = pi.ingestFolder;
        addTaskToQueue(derivadaQueue, task);
        cb(task);
      } else {
        errcb('error', 'No encuentro el P.I.');
      }
    })
    .catch((error) => console.error(error));
}


function pushDerivadaAssetTask(task, errcb, cb) {
  const assetId = task.entityId;

  if (!assetId) {
    errcb('error', 'No tengo ID de asset');
    return;
  }

  console.log('ASSET RECORD: [%s]', assetId, assetRecord);

  assetRecord.findById(assetId)
    .exec()
    .then(asset => {
      if (asset) {
        task.status = 'Tarea iniciada';
        task.asset = asset;
        addTaskToQueue(derivadaAssetQueue, task);
        cb(task);
      } else {
        errcb('error', 'No encuentro el asset');
      }
    })
    .catch((error) => console.error(error));
}

/**
 * Chequea la existencia de una carpeta; si no existe, la crea, considerando cada segmento
 * de la ruta
 *
 * @param folder          la ruta completa cuya existencia se desea probar
 * @param folderTokens    array de carpetas que en su conjunto describen la ruta completa
 * @private
 */
function _ensurePath(folder, folderTokens) {
  let destinationPath = '';

  if (fs.existsSync(folder)) {
    return folder;
  }


  for (let k = 0; k < folderTokens.length; k++) {
    destinationPath = path.join('/', destinationPath, folderTokens[k]);
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath);
    }
  }

  return destinationPath;
}


/**
 * Verifica si se permite crear derivada para un determinado mime-type
 *
 * @param mimeToTest        El mime-type que se va a testear
 * @return {boolean}
 * @private
 */
function _verifyIsAllowedMimetype(mimeToTest) {
  const mimeTypeExists = mimeTypeOptList.find(item => item.val === mimeToTest);
  let isMimeTypeAllowed = false;

  if (mimeTypeExists) {
    isMimeTypeAllowed = MIMETYPES_ALLOWED.includes(mimeTypeExists.val);
  }

  return isMimeTypeAllowed;
}

/**
 * Retorna una cadena de caracteres con el formato apropiado para definir las dimensiones
 * de una imagen destino, al utilizar ImageMagick
 * @param taskOptions   un objeto con las keys alto y ancho; valores numéricos enteros
 * @return {string}
 * @private
 */
function _recrearDimensionesImagen(taskOptions) {
  let dimensiones = '';

  if (taskOptions && taskOptions.ancho && taskOptions.ancho > 0) {
    dimensiones += taskOptions.ancho;
  }

  if (taskOptions && taskOptions.alto && taskOptions.alto > 0) {
    dimensiones += 'x' + taskOptions.alto;
  }

  return dimensiones;
}

/**
 * Verifica si una tarea-asset corresponde a la generación de una derivada para
 * una carpeta contenedora
 *
 * @param taskOptions   un objeto con la key esCarpetaContenedora; valor booleano
 * @return {boolean}
 * @private
 */

function _esCarpetaContenedora(taskOptions) {
  return taskOptions && taskOptions.esCarpetaContenedora;
}

function _getName(fileName) {
  if (!fileName) return '';

  return path.parse(fileName).name;
}


/********************************************************************************
 * Generación recursiva de derivadas
 *
 */
function _esDirectorio(dirNode) {
  return dirNode && dirNode.type && dirNode.type === FILETYPE_DIRECTORY;
}

function _tieneHijos(dirNode) {
  return dirNode && dirNode.children && dirNode.children.length > 0;
}

function _crearDirectorioSiNoExiste(ruta) {
  if (!fs.existsSync(ruta)) {
    fs.mkdirSync(ruta, (error) => {
      if (error) {
        return console.error(error);
      }
    });
  }
}

function _recrearRutaDestino(carpetaDestino, nombreDestino, extension) {
  return path.join('/', carpetaDestino, nombreDestino + extension);
}

function _construirOpcionesParaMogrify(processType, currentPath, destinationFolder) {
  let options = [];
  let size_opt = processType === TYPE_DERIVADA ? 'x900' : 'x200';

  options.push("-path");
  options.push(destinationFolder);

  options.push("-thumbnail");
  options.push(size_opt)

  options.push("-format");
  options.push("jpg");

  options.push(currentPath + "/*.{jpeg,jpg,gif,tiff,tif}[0]");
  return options;
}

function _construirOpcionesParaConvert(mimeType, processType) {
  let options;

  if (mimeType === 'application/pdf') {
    options = (processType === TYPE_DERIVADA) ? CONVERT_OPTION_DERIVADA_PDF : CONVERT_OPTION_THUMBNAIL_PDF;
  } else {
    options = (processType === TYPE_DERIVADA) ? CONVERT_OPTION_DERIVADA : CONVERT_OPTION_THUMBNAIL;
  }

  return options;
}

/**
 * Escanea recursivamente un directorio, generando una thumbnail o una derivada dependiendo del parámetro
 * processType
 *
 * @param {*} dirNode el elemento qque se va a procesar, puede ser file o directorio
 * @param {*} processType el tipo de proceso que está corriendo (miniatura o derivada)
 * @param {Array<Promise>} un array donde almacenar las promesas que la función va generando para cada proceso
 * lanzado mediante spawn
 * @returns
 */
function _procesarDirectorio(dirNode, processType, processArray = [], job, progressCount, progress_status, messageProducer) {

  if (!GHOST_FOLDERS.includes(dirNode.name)) {
    console.log('1.0.0: NOT_GOST')
    if (_esDirectorio(dirNode) && _tieneHijos(dirNode)) {
      let currentPath = dirNode.path;
      console.log('1.1.0: DIRECTORY && HAS CHILDREN READY TO MOGRIFY [%s]', currentPath);

      let destinationFolder;
      if (processType === TYPE_DERIVADA){
        //path.parse(dirNode.path).name
        destinationFolder = path.join(currentPath, DERIVADA_FOLDER);
      }else{ 
        destinationFolder = path.join(currentPath, THUMBNAIL_FOLDER);
      }

      console.log('1.1.2: destinationFOLDER: [%s]',destinationFolder )
      _crearDirectorioSiNoExiste(destinationFolder);

      try {
        let theProcess;
        let options = _construirOpcionesParaMogrify(processType, currentPath, destinationFolder);

        // Para extraer la portada de un PDF es otro comando
        console.log('620 ======= spawn mogrify =============')
        console.dir(options);
        theProcess = spawn('mogrify', [ ...options ]);
        console.log('622 ===========================================')

        /**Test */
        theProcess.stdout.on('data', (data) => {
          // hace falta consumir el stdout
        });

        theProcess.stderr.on('data', (data) => {
          // hace falta consumir el sterr
        });

        /** FIn test */
        const processPromise = new Promise(function (resolve, reject) {
          theProcess.on('close', (code) => {
            if(code){
              job.data.status = ERROR_STATUS + code;
            }else {
              /*
                4-11-2021: Las imágenes thumbnail o derivadas se generaban con
                permisos incorrectos; este chmod los ajusta apropiadamente.
              */
              //spawn('chmod', [THUMBNAIL_DERIVADA_FILE_PERMISSIONS, destino]);



              job.data.status = OK_STATUS;
            }

            progressCount += 100;
            progress_status.progress = progressCount;
            progress_status.status = job.data.status;
            //messageProducer.add({ ...progress_status })
            console.log('==== PROCESS ON CLOSE >>>>>> [%s][%o] [%s]', code, progress_status, progressCount)
            job.progress(progress_status)

            resolve(code);
          });

          theProcess.on('error', (error) => {
            reject(error);
          });
        });
        console.log('==== ADDING  PROMISE to processArray >>>>>>')

        processArray.push(processPromise);
      } catch (error) {
        console.error('Error: ', error);
      }

      //dirNode.children.forEach((hijo) => _procesarDirectorio(hijo, processType, processArray, job, progressCount, progress_status, messageProducer));
      // =====================================================
      dirNode.children.forEach((hijo) => {
        if (_esDirectorio(hijo) && _tieneHijos(hijo)) {
          _procesarDirectorio(hijo, processType, processArray, job, progressCount, progress_status, messageProducer)
        }

      });
    } 
    
  }else {
    console.log('2.0.0 GOST ')
  }
}


/**
 *  +++++++++++++DEPRECATED +++++++++++++++++
 *
 * @param {*} dirOldNode el elemento qque se va a escanear
 * @param {*} processType el tipo de proceso que está corriendo (miniatura o derivada)
 * @param {Array<Promise>} un array donde almacenar las promesas
 * @returns
 */
 function _procesarDirectorio_old(dirOldNode, processType, processArray = [], job, progressCount, progress_status, messageProducer) {

  if (!GHOST_FOLDERS.includes(dirOldNode.name)) {
    console.log('1.0.0: NOT_GOST')
    if (_esDirectorio(dirOldNode) && _tieneHijos(dirOldNode)) {
      console.log('1.1.0: DIRECTORY && HAS CHILDREN')
      dirOldNode.children.forEach((hijo) => _procesarDirectorio_old(hijo, processType, processArray, job, progressCount, progress_status, messageProducer));
    } else {
      console.log('1.2.0: ITEM')
      const origen = dirOldNode.path;
      const mimeType = utils.getMimeType(origen);

      if (_verifyIsAllowedMimetype(mimeType)) {
        console.log('1.2.1: mimetype OK: [%s] origen: [%s]', mimeType, origen)
        let destinationFolder;
        let options = _construirOpcionesParaConvert(mimeType, processType);

        if (processType === TYPE_DERIVADA){
          destinationFolder = path.join(path.parse(dirOldNode.path).dir, DERIVADA_FOLDER);
          console.log('1.2.1.01: type derivada: destinationFOLDER: [%s]',destinationFolder )
        }else{ 
          destinationFolder = path.join(path.parse(dirOldNode.path).dir, THUMBNAIL_FOLDER);
          console.log('1.2.1.02: type thumbnail: destinationFOLDER: [%s]',destinationFolder )
        }


        _crearDirectorioSiNoExiste(destinationFolder);

        const destino = _recrearRutaDestino(destinationFolder, path.parse(origen).name, '.jpg')

        try {
          let theProcess;
          // Para extraer la portada de un PDF es otro comando
          if (mimeType === 'application/pdf'){
            console.log('632 ======= spawn application/pdf =============')
            console.log('origen: [%s]    destino: [%s]', origen+ '[0]', destino)
            console.dir(options);
            theProcess = spawn('convert', [...options, origen + '[0]', destino]);
            console.log('634 ===========================================')

          } else {
            console.log('638 ======= spawn image =============')
            console.log('origen: [%s]    destino: [%s]', origen, destino)
            console.dir(options);
            theProcess = spawn('convert', [...options, origen, destino]);
            console.log('640 ===========================================')
          }

          /**Test */
          theProcess.stdout.on('data', (data) => {
            // hace falta consumir el stdout
          });

          theProcess.stderr.on('data', (data) => {
            // hace falta consumir el sterr
          });

          /** FIn test */
          const processPromise = new Promise(function (resolve, reject) {
            theProcess.on('close', (code) => {
              if(code){
                job.data.status = ERROR_STATUS + code;
              }else {
                /*
                  4-11-2021: Las imágenes thumbnail o derivadas se generaban con
                  permisos incorrectos; este chmod los ajusta apropiadamente.
                */
                //spawn('chmod', [THUMBNAIL_DERIVADA_FILE_PERMISSIONS, destino]);



                job.data.status = OK_STATUS;
              }

              progressCount += 100;
              progress_status.progress = progressCount;
              progress_status.status = job.data.status;
              //messageProducer.add({ ...progress_status })
              console.log('==== PROCESS ON CLOSE >>>>>> [%s][%o] [%s]', code, progress_status, progressCount)
              job.progress(progress_status)

              resolve(code);
            });

            theProcess.on('error', (error) => {
              reject(error);
            });
          });
          console.log('==== ADDING  PROMISE to processArray >>>>>>')

          processArray.push(processPromise);
        } catch (error) {
          console.error('Error: ', error);
        }
      }else {
        console.log('1.2.2: mimetype NOT ALLOWED: ', mimeType)

      }
    }
  }else {
    console.log('2.0.0 GOST ')
  }
}
