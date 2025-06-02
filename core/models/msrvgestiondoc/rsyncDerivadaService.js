/**
 * MicroServicio DERIVADAS RSYNC.  Produce / consume tareas de rsync hacia servidor de derivadas
 */
const whoami = 'models/msrvgestiondoc/rsyncService: ';
const fs = require('fs');
const path = require('path');

var Rsync = require('rsync');
const Queue = require('bull');

const config = require('../../config/config');

const INGESTA_SRVR = 'ingesta';
const DERIVADA_SRVR = 'derivadas';

const servers = config.serversAvailable;

const ingestServer = servers.find(t => t.val === INGESTA_SRVR);
const ingestMountingPath = config[ingestServer.mountingPath];
const ingestServerPath = ingestServer.serverPath;

const derivadaServer = servers.find(t => t.val === DERIVADA_SRVR);
const derivadaMountingPath = config[derivadaServer.mountingPath];
const derivadaServerPath = derivadaServer.serverPath;

const ingestProcessRecord = require('../ingestProcessModel').getRecord();
const assetRecord = require('../assetModel').getMongooseModel();

const MESSAGE_QUEUE = 'message:bagit';
const RSYNC_QUEUE = 'rsync:ingest:derivada';

const OK_STATUS = 'rsync:ingest:derivada:OK';
const ERROR_STATUS = 'rsync:ingest:derivada:ERROR';
const NOT_READY = 'rsync:ingest:derivada:ERROR Ingest process not ready';
const ON_PROCESS = 'rsync:ingest:derivada: EN PROCESO';
const STARTED = 'rsync:ingest:derivada: INICIADO';

/////////////////////////// API ///////////////////////////

/**
 * Expone el método ingestToDerivada, que inicia la tarea rsync para mover una carpeta desde ingesta hacia
 * el área de derivadas
 */
exports.ingestToDerivada = ingestToDerivadaTask;


/////////////////////////// INIT QUEUE ///////////////////////////
const ingestRsyncQueue = new Queue(RSYNC_QUEUE);
addListenerToQueue(ingestRsyncQueue);

/////////////////////////// LISTENER ///////////////////////////
function addListenerToQueue(queue) {
  queue.on('global:completed', (job, result) => {
    console.log(`Tarea finalizada OK - result:[${result}]`);
  });
}

/////////////////////////// WORKER ///////////////////////////
function rsyncIngestDerivadaWorker(queue, processFn) {
  queue.process(async (job, done) => {
    await processFn(job, done)

  })
}

rsyncIngestDerivadaWorker(ingestRsyncQueue, (job, done) => {
  let task = job.data;

  let messageProducer = new Queue(MESSAGE_QUEUE);
  let progress_status = {
      progress: 0,
      status: '',
      queue: RSYNC_QUEUE,
      identifier: task.entityId,
      jobid: job.id
  };

  let sPath = task.source;
  let tPath = task.target

  const rsync = new Rsync()
    .shell('ssh')
    .flags('a')
    .source(sPath)
    .destination(tPath);

  rsync.execute(function (error, code, cmd) {

    if (!code) {
      task.status = OK_STATUS;
      updateIngestProcess(task.entityId, task, messageProducer, progress_status)

    } else {
      task.status = ERROR_STATUS + code;
    }

    progress_status.progress = 100000;
    progress_status.status =  task.status;    
    messageProducer.add({ ...progress_status });
    done(null, task.status);
  });
});


/////////////////////////// FUNCIONES HELPER ///////////////////////////
function _buildIngestSourcePath(task) {
  return path.join(ingestMountingPath, ingestServerPath, task.ingestFolder.path);
}

function _buildDerivadaTargetPath(task) {
  let today = new Date();
  let day = ('0000' + today.getDate()).substr(-2);
  let month = ('0000' + (today.getMonth() + 1)).substr(-2);
  let year = today.getFullYear() + '';

  task.basename = task.ingestFolder.basename;
  task.serverPath = derivadaServerPath;
  task.rootPath = path.join(year, month, day, task.basename);
  task.pathTokens = [derivadaMountingPath, derivadaServerPath, year, month, day];
  task.target = path.join(...task.pathTokens);

  _ensureTargetPath(task);

  return task.target;
}

function setNormalizedFileName(filename, asset) {
  if (!filename) return 'file-name-error';
  if (filename.indexOf(asset._id) !== -1) return filename;

  let parsed = path.parse(filename);
  return path.join(parsed.dir, safeFileName(parsed.name) + "-" + asset._id + parsed.ext);
};

function _ensureTargetPath(task) {
  if (fs.existsSync(task.target)) return;

  let destinationPath = '';

  task.pathTokens.forEach(spath => {
    destinationPath = path.join(destinationPath, spath);
    if (!fs.existsSync(destinationPath)) fs.mkdirSync(destinationPath);
  });
}


/////////////////////////// ACTUALIZAR P.I. AL FINALIZAR LA TAREA ///////////////////////////
function updateIngestProcess(ingestProcessId, task, messageProducer, progress_status){
  ingestProcessRecord.findById(ingestProcessId).lean().exec()
    .then(ip => {

      if (ip) {
        progress_status.progress = 200000;
        messageProducer.add({ ...progress_status });
        _updateIngestToDerivada(ip, task, messageProducer, progress_status);
      }

    });
}


async function _updateIngestToDerivada(ip, task, messageProducer, progress_status) {
  /** Actualizar ingestFolder en el proceso de ingesta **/
  ip.ingestFolder.server = DERIVADA_SRVR;
  ip.ingestFolder.serverPath = task.serverPath;
  ip.ingestFolder.rootPath = task.rootPath;
  ip.ingestFolder.path = task.target;
  await ingestProcessRecord.findByIdAndUpdate(ip._id, ip).exec();

  /**
   * Actualizar, en la colección assets, aquellos assets referenciados por el array de assetHook del parte de
   * ingesta (tipo parte = derivada)
   */
  const hasAssets = ip.assetHookList && ip.assetHookList.length > 0;
  const isAssetBaggit = task.ingestFolder.isBaggit;

  if (hasAssets) {
    const derivadaPath = task.rootPath;
    let assetList = [];

    for (let i = 0; i < ip.assetHookList.length; i++) {
      let asset = await assetRecord.findById(ip.assetHookList[i].assetId).lean().exec();
      //asset.serverPath = task.serverPath;
      //asset.rootPath = task.rootPath;
      //asset.path = path.join(asset.rootPath, asset.bundlePath);
      asset.hasDerivada = true;

      asset = await assetRecord.findByIdAndUpdate(asset._id, asset).exec();
      assetList.push(asset);

      progress_status.progress += 100;
      messageProducer.add({ ...progress_status });

    }
    ip.assetList = assetList;
    await ingestProcessRecord.findByIdAndUpdate(ip._id, ip).exec();
    progress_status.progress = 999999;
    progress_status.status = 'asset and ip updated'
    messageProducer.add({ ...progress_status });
  }
}


/////////////////////////// PRODUCTORES ///////////////////////////
async function addTaskToQueue(queue, task) {
  const job = await queue.add(task)
}

function ingestToDerivadaTask(task, errcb, cb) {
  let ingestProcessId = task.entityId;

  if (!ingestProcessId) {
    errcb('error', 'No hay ID de parte de ingesta');
    return;
  }

  ingestProcessRecord.findById(ingestProcessId).lean().exec().then(pi => {
    if (pi) {
      if (pi.ingestFolder.isBaggit) {
        task.status = STARTED;
        task.ingestFolder = pi.ingestFolder;
        task.source = _buildIngestSourcePath(task)
        task.target = _buildDerivadaTargetPath(task);

        if (!task.target) {
          task.status = NOT_READY;
          cb(task);
          return;
        }

        addTaskToQueue(ingestRsyncQueue, task);
        task.status = ON_PROCESS;
        cb(task);

      } else {
        task.status = NOT_READY;
        cb(task);
      }

    } else {
      errcb('error', 'No encuentro el P.I.');
    }
  })
}
