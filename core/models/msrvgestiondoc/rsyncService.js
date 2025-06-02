/**
 * MicroServicio RSYNC.  Produce / consume tareas de rsync
 */
const whoami =  "models/msrvgestiondoc/rsyncService: ";
const fs = require('fs');
const path = require('path');

var Rsync = require('rsync');
const Queue = require('bull');

const config = require('../../config/config');

const INGESTA_SRVR = 'ingesta';
const MASTER_SRVR = 'master';

const servers = config.serversAvailable;

const ingestServer = servers.find(t => t.val === INGESTA_SRVR );
const ingestMountingPath = config[ingestServer.mountingPath];
const ingestServerPath = ingestServer.serverPath;

const masterServer = servers.find(t => t.val === MASTER_SRVR );
const masterMountingPath = config[masterServer.mountingPath];
const masterServerPath =   masterServer.serverPath;

const ingestProcessRecord = require('../ingestProcessModel').getRecord();
const assetRecord = require('../assetModel').getMongooseModel();

const MESSAGE_QUEUE = 'message:bagit';
const RSYNC_QUEUE = 'rsync:ingest:master'

const OK_STATUS = 'rsync:ingest:master:OK';
const ERROR_STATUS = 'rsync:ingest:master:ERROR';
const NOT_READY = 'rsync:ingest:master:ERROR Ingest process not ready';
const ON_PROCESS = 'rsync:ingest:master: EN PROCESO';
const STARTED = 'rsync:ingest:master: INICIADO';

/**
 * ************************
 *       API
 * **********************
 */


/**
*   /api/msrvgestiondoc/rsync/ingesttomaster
*/
exports.ingesttomaster = ingetToMasterTask;


/**
 * ************************
 *      INIT QUEUE
 * **********************
 */
const ingestRsyncQueue = new Queue(RSYNC_QUEUE);  // rsync:source:destination
addListenerToQueue(ingestRsyncQueue);

/**
 * ************************
 *      LISTENER
 * **********************
 */
 function addListenerToQueue(queue){
    queue.on('global:completed', (job, result) => {
        console.log(` Job OK - result:[${result}]`);

    })
}

/**
 * ************************
 *       WOKRKER(s)
 * **********************
 */
 function rsyncIngestMasterWorker(queue, processFn){
    queue.process(async (job, done) => {
        //job.progress(progress);
        await processFn(job, done)

    })
}

rsyncIngestMasterWorker(ingestRsyncQueue, (job, done) => {
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

        if(!code){
            task.status = OK_STATUS;
            updateIngestProcess(task.entityId, task, messageProducer, progress_status)
        }else {
            task.status = ERROR_STATUS + code;
        }

        progress_status.progress = 100000;
        progress_status.status =  task.status;
        messageProducer.add({ ...progress_status });
        done(null, task.status);
    });

})


/**
 * ************************
 *      HELPER
 * **********************
 */

function _buildIngestSourcePath(task){
  const serverData = servers.find(s => s.val === task.ingestFolder.server);
  const taskMountingPath = config[serverData.mountingPath];
  const taskServerPath = serverData.serverPath;

  return path.join(taskMountingPath, taskServerPath, task.ingestFolder.path);
}

function _buildMasterTargetPath(task){
  let today = new Date();
  let day   = ('0000' + today.getDate()).substr(-2);
  let month = ('0000' + (today.getMonth()+1)).substr(-2);
  let year = today.getFullYear() + '';

  // T138: agrega timestamp a la ruta en master
  const timestamp = Date.now().toString();

  task.basename = task.ingestFolder.basename;
  task.serverPath = masterServerPath;
  task.rootPath =  path.join( year, month, day, timestamp, task.basename);
  task.pathTokens = [ masterMountingPath, masterServerPath, year, month, day, timestamp ];
  task.target = path.join(  ...task.pathTokens );

  _ensureTargetPath(task);

  return task.target;
}

function setNormalizedFileName(filename, asset){
    if(!filename) return 'file-name-error';
    if(filename.indexOf(asset._id) !== -1) return filename;

    let parsed = path.parse(filename);
    return  path.join( parsed.dir, safeFileName(parsed.name) + "-" + asset._id + parsed.ext);
};

function _ensureTargetPath(task){
    if(fs.existsSync(task.target)) return;

    let destinationPath = '';
    task.pathTokens.forEach(spath => {

        destinationPath = path.join(destinationPath, spath);
        if(!fs.existsSync(destinationPath)) fs.mkdirSync(destinationPath);
    })
}


/**
 * *************************************
 *      UPDATE MODEL WHEN JOB IS DONE
 * ***********************************
 */
 function updateIngestProcess(ingestProcessId, task, messageProducer, progress_status){
    // se deben actualizar los assets!
    ingestProcessRecord.findById(ingestProcessId).lean().exec()
      .then(ip => {
        if(ip) {

            progress_status.progress = 200000;
            messageProducer.add({ ...progress_status });
            _updateIngestToMaster(ip, task, messageProducer, progress_status);

            //ingestProcessRecord.findByIdAndUpdate(ingestProcessId, {ingestFolder: ingestFolder} ).exec();
        }else {
           //todo
        }
    });
}


// task.basename = task.ingestFolder.basename;
// task.serverPath = masterServerPath;
// task.rootPath =  path.join( year, month, day, task.basename);
// task.pathTokens = [ masterMountingPath, masterServerPath, year, month, day ];
// task.target = path.join(  ...task.pathTokens );

async function _updateIngestToMaster(ip, task, messageProducer, progress_status) {
  /** Actualizar ingestFolder en el proceso de ingesta **/
  ip.ingestFolder.server = MASTER_SRVR;
  ip.ingestFolder.serverPath = task.serverPath;
  ip.ingestFolder.rootPath = task.rootPath;
  ip.ingestFolder.path = task.target;
  await ingestProcessRecord.findByIdAndUpdate(ip._id, ip).exec();

  /**
   * Actualizar, en la colección assets, aquellos assets referenciados por el array de assetHook del parte de
   * ingesta
   */
  const hasAssets = ip.assetHookList && ip.assetHookList.length > 0;
  const isAssetBaggit = task.ingestFolder.isBaggit;

  if (hasAssets) {
    const masterPath = task.rootPath;
    let assetList = [];

    for (let i = 0; i < ip.assetHookList.length; i++) {
      let asset = await assetRecord.findById(ip.assetHookList[i].assetId).lean().exec();
      asset.serverPath = task.serverPath;
      asset.rootPath = task.rootPath;
      asset.path = path.join ("/" , asset.rootPath, asset.bundlePath);

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





/**
 * ****************************
 *       PRODUCER - TRIGGER
 * *************************
 */
 async function addTaskToQueue(queue, task){
    const job = await queue.add(task)
    //c onsole.dir(job);
}

function ingetToMasterTask (task,  errcb, cb) {
    let ingestProcessId = task.entityId;

    if(!ingestProcessId) {
        errcb('error', 'noIngestProcess ID');
        return;
    }

    ingestProcessRecord.findById(ingestProcessId).lean().exec().then(pi => {
        if(pi){
            if(pi.ingestFolder.isBaggit){
                task.status = STARTED;
                task.ingestFolder = pi.ingestFolder;
                task.source = _buildIngestSourcePath(task)
                task.target = _buildMasterTargetPath(task);

                if(!task.target) {
                    task.status = NOT_READY;
                    cb(task);
                    return;
                }

                addTaskToQueue(ingestRsyncQueue, task);
                task.status = ON_PROCESS;
                cb(task);

            }else {
                task.status = NOT_READY;
                cb(task);
                return;
            }

        }else {
            errcb('error', 'cant retrieve PI');
            return;
        }
    })
}
