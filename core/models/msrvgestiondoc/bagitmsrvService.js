/**
 * MicroServicio BAGIT.  Produce / consume tareas bagit
 */

const whoami = "models/msrvgestiondoc/bagitmsrvService: ";

const { URL } = require('url');
const path = require('path');
const { spawn, exec } = require('child_process');

var mongoose = require('mongoose');
const Queue = require('bull');

const config = require('../../config/config');
const utils = require('../../services/commons.utils');
const { consoleTestResultHandler } = require('tslint/lib/test');

const INGESTA_SRVR = 'ingesta';
const MASTER_SRVR = 'master';
const PY_ENV_BIN = 'source $HOME/env/bin/activate';

const BAGIT_QUEUE = 'bagit:pingesta:ingestfolder';
const MESSAGE_QUEUE = 'message:bagit';


const servers = config.serversAvailable;

const ingestServer = servers.find(t => t.val === INGESTA_SRVR);
const ingestMountingPath = config[ingestServer.mountingPath];
const ingestServerPath = ingestServer.serverPath;

const masterServer = servers.find(t => t.val === MASTER_SRVR);
const masterMountingPath = config[masterServer.mountingPath];
const masterServerPath = masterServer.serverPath;

var ingestProcessRecord = require('../ingestProcessModel').getRecord();

const self = this;
const OK_STATUS = 'bagitOK';
const ERROR_STATUS = 'bagitERROR::';


/**
 * ************************
 *       API
 * **********************
 */
/**
*   /api/msrvgestiondoc/pushbagit
*   pushbagittask
*/
exports.pushbagittask = pushbagitTask;


/**
 * ************************
 *      INIT QUEUE
 * **********************
 */
const bagitQueue = new Queue(BAGIT_QUEUE);

addListenerToQueue(bagitQueue);

registerBaggitWorker(bagitQueue, _baggitExecutorFn);

//activatePython();

/**
 * **************************
 *      CONSUMER - WORKER  *
 * ************************
 */
 async function _baggitExecutorFn(job) {
  const bagitPromise = new Promise((resolve, rej)=> {

      let messageProducer = new Queue(MESSAGE_QUEUE);

      for (const status of ['active', 'completed', 'delayed', 'failed', 'wait']) {
        messageProducer.clean(100, status);
      }

      let task = job.data;
      let progress = 0;

      let progress_status = {
          progress: 0,
          status: '',
          queue: BAGIT_QUEUE,
          identifier: task.entityId,
          jobid: job.id
      };

      const server = utils.getServer(task.ingestFolder.server);
      let targetFolder = path.join( server.publicPath, server.serverPath, task.ingestFolder.path );
      job.progress(progress_status)

      const bagit = spawn('bagit.py', ['--sha256', targetFolder]);

      bagit.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        progress += 100;
        progress_status.progress = progress;
        progress_status.status =  'stdout_in progress';
        //messageProducer.add({ ...progress_status })
        job.progress(progress_status)
      });

      bagit.stderr.on('data', (data) => {
          progress += 100;
          progress_status.progress = progress;
          progress_status.status =  'stderr in PROGRESS';
          //console.log(`stderr: ${data}`);
          messageProducer.add({ ...progress_status })
          job.progress(progress_status)
      });

      bagit.on('close', (code) => {
        if(code){
          task.status = ERROR_STATUS + code;

        }else {
          task.status = OK_STATUS;
          updateIngestProcess(task.entityId)
        }

        console.log(`bagit.on.close: code: ${task.status}`);
        progress_status.progress = 999999;
        progress_status.status =  task.status;
        messageProducer.add({ ...progress_status })
        job.progress(progress_status)

        resolve(task.status);
      });

  })
  return bagitPromise;

}

function updateIngestProcess(ingestProcessId){
  ingestProcessRecord.findById(ingestProcessId).exec().then(pi => {
      if(pi){
          let ingestFolder = pi.ingestFolder;
          ingestFolder.isBaggit = true;
          ingestProcessRecord.findByIdAndUpdate(ingestProcessId, {ingestFolder: ingestFolder} ).exec();
      }else {
         //todo
      }
  })
}

function registerBaggitWorker(queue, executorFn){
  queue.process(async (job) => {
      let result = await executorFn(job);
      console.log('1.2.[%s] bagit process task async done! [%s]==[%s]',job.id, result, job.data.status);
      return result;
  })
}


/**
 * ************************
 *      events
 * **********************
 */
function addListenerToQueue(queue) {
  queue.on('global:completed', (job, result) => {
    console.log(` Job OK - result:[${result}]`);

  })
}



function activatePython() {

  const activate = exec(PY_ENV_BIN, function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log("Error code: [%s]", error.code);
      console.log("Signal received: [%s]", error.signal);
    }
    console.log('Child process STDOUT: [%s]', stdout);
    console.log('Child process STDERR: [%s]', stderr);

  });

  activate.on('exit', function (code) {
    console.log('Activate Py exited with code: [%s]', code);
  });

}

/**
 * ************************
 *       PRODUCER
 * **********************
 */
 function pushbagitTask(task, errcb, cb) {
  let ingestProcessId = task.entityId;

  if (!ingestProcessId) {
    errcb('error', 'noIngestProcess ID');
    return;
  }

  console.log('pushbagitTask BEGIN')

  ingestProcessRecord.findById(ingestProcessId).exec().then(pi => {
    if(pi) {
      console.log('pi fetched: [%s]', pi.ingestFolder.isBaggit)
      //OjO ver qué pasa
      if(true){ // no re-baggiteamos
      //if (!pi.ingestFolder.isBaggit) { // no re-baggiteamos
        task.status = 'JOB STARTED';
        task.ingestFolder = pi.ingestFolder;

        addTaskToQueue(bagitQueue, task);

        cb(task);

      } else {
        task.status = 'ALREADY IN QUEUE';
        cb(task);
        return;
      }
    } else {
      errcb('error', 'cant retrieve PI');
      return;
    }
  })

}

async function addTaskToQueue(queue, task){
  console.log('queue ADDED')
  const job = await queue.add(task)
}

