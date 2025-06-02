const whoami = "services/bullQueueStatus";
/***
 * publish-subscribe  que reporta el progreso de colas de trabajo
 */
const path = require('path');
const fs = require('fs');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const config = require('../config/config');
const Queue = require('bull');
const utils = require('./commons.utils');
const { spawn, exec } = require('child_process');


const ipModule = require('../models/ingestProcessModel');
const assetModule = require('../models/assetModel');
const udaModule = require('../models/unidadDescripcionModel');

const { promise } = require("protractor");
const { fstat } = require('fs');
const { convertCompilerOptionsFromJson } = require('typescript');

// Mongoose Models
const udaModel = udaModule.GestionDocRecord;
const ipModel = ipModule.getRecord();
const assetModel = assetModule.getMongooseModel();

const storageDir = config.storagePath;
const publicPath = config.publicPath;

const FILETYPE_DIRECTORY = 'directory';
const FILETYPE_FILE = 'file';
const EXT_PDF = '.pdf';
const EXT_JPEG = '.jpg';

const OK_STATUS = 'bagitOK';
const ERROR_STATUS = 'bagitERROR:: ';

const servers = config.serversAvailable;

const MESSAGE_QUEUE = 'message:bagit';
const DERIVADA_MESSAGE_QUEUE = 'message:derivada';
const THUMBNAIL_MESSAGE_QUEUE = 'message:thumbnail';
const PDF_MESSAGE_QUEUE = 'message:pdf';
const queueMasterList = [
    {
        name: 'pingesta:ingestfolder:thumbnail',
        message: '',
        status: ''
    },
    {
        name: 'pingesta:ingestfolder:derivada',
        message: '',
        status: ''
    },
    {
        name: 'pingesta:asset:derivada',
        message: '',
        status: ''
    },
    {
        name: 'bagit:pingesta:ingestfolder',
        message: '',
        status: ''
    },
    {
        name: 'rsync:ingest:master',
        message: '',
        status: ''
    },
    {
        name: 'test:dummy:queue',
        message: '',
        status: ''
    },
]

/**
 *  message queue
        {
            id: '2297',
            data: {
            progress: {
                progress: 36600,
                status: 'stderr in progress',
                queue: 'bagit:pingesta:ingestfolder',
                jobid: '149'
            }
            },
            timestamp: 2021-09-20T13:22:38.082Z,
            processedOn: 2021-09-20T13:22:38.082Z,
            finishedOn: 2021-09-20T13:22:38.082Z,
            name: '__default__',
            failedReason: undefined,
            stackTrace: [],
            returnValue: null,
            attemptsMade: 0,
            delay: 0,
            progress: 0
        },
 */


//const thumbnailQueue = new Queue('pingesta:ingestfolder:thumbnail');
//const derivadaQueue = new Queue('pingesta:ingestfolder:derivada');
//const derivadaAssetQueue = new Queue('pingesta:asset:derivada');
//const bagitQueue = new Queue('bagit:pingesta:ingestfolder');
//const rsyncMasterQueue = new Queue('rsync:ingest:master');

async function registerMessageReceiver(){
    let queue = new Queue(MESSAGE_QUEUE);
    await queue.process(async (job, done) => {
        //c onsole.log('ProgressMessage received -->[%s] [%s]', job.data.progress, job.data.progress.queue.split(':')[2]);
        //c onsole.log('ProgressMessage received -->[%s] ', job.data.progress);
        done();
    })
}
async function registerDerivadaMessageReceiver(){
    let queue = new Queue(DERIVADA_MESSAGE_QUEUE);
    await queue.process(async (job, done) => {
        //c onsole.log('ProgressMessage DERIVADA received -->[%s] ', job.data.progress);
        done();
    })
}
async function registerThumbnailMessageReceiver(){
    let queue = new Queue(THUMBNAIL_MESSAGE_QUEUE);
    await queue.process(async (job, done) => {
        //c onsole.log('[%s] ProgressMessage THUMBNAIL received -->[%s] - [%s] ', whoami, job.data.progress, job.data.queue);
        done();
    })
}

async function registerPDFMessageReceiver(){
  let queue = new Queue(PDF_MESSAGE_QUEUE);
  await queue.process(async (job, done) => {
      //c onsole.log('ProgressMessage PDF received -->[%s] [%s]', job.data.progress, job.data.queue);
      done();
  })
}

registerMessageReceiver()
registerDerivadaMessageReceiver();
registerThumbnailMessageReceiver();
registerPDFMessageReceiver();

/////////   API /////////////

exports.testQueue = triggerTestQueue;

exports.progressStatus = fetchMessages;
exports.derivadaProgressStatus = fetchDerivadaMessages;
exports.thumbnailProgressStatus = fetchThumbnailMessages;
exports.pdfProgressStatus = fetchPDFMessages;
// exports.cleanDerivadaQueue = cleanDerivadaQueue;
// exports.cleanThumbnailQueue = cleanThumbnailQueue;


// IMPLEMENTACIÓN

/////////   MESSAGE QUEUE: fetchProgressMessages /////////////
function fetchMessages(errcb, cb){
    let msjQueue = new Queue(MESSAGE_QUEUE);

    msjQueue.getCompleted(0, 10).then(list => {
        cb(list.map(t => t.data));
    })
}

function fetchDerivadaMessages(errcb, cb){
    let msjQueue = new Queue(DERIVADA_MESSAGE_QUEUE);
    msjQueue.getCompleted(0, 10).then(list => {
        cb(list.map(t => t.data));
    })

}

function fetchThumbnailMessages(errcb, cb){
    let msjQueue = new Queue(THUMBNAIL_MESSAGE_QUEUE);

    msjQueue.getCompleted(0, 10).then(list => {
        //c onsole.log("Contesto queue [%s]",list && list.length);
        cb(list.map(t => t.data));
    })
    /**
     *  progress: number;
  status: string;
  queue: string;
  identifier: string;
  jobid: string;
     */
    // cb([{
    //   progress: 10,
    //   status: 'ok',
    //   queue: 'msg:thumb',
    //   identifier: 'thumbnail',
    //   jobid: 'N'
    // }]);
}

function fetchPDFMessages(errcb, cb){
  const msjQueue = new Queue(PDF_MESSAGE_QUEUE);
  msjQueue.getCompleted(0, 10).then(list => {
      cb(list.map(t => t.data));
  })
}

/////////   CAPA DE SERVICIOS /////////////

// function cleanDerivadaQueue() {
//     const msjQueue = new Queue(DERIVADA_MESSAGE_QUEUE);
//     msjQueue.clean(Date.now() ,'completed');
// }


// function cleanThumbnailQueue() {
//     const msjQueue = new Queue(THUMBNAIL_MESSAGE_QUEUE);
//     msjQueue.clean(Date.now() ,'completed');
// }


/////////   TEST /////////////
const TEST_QUEUE1 = 'test:queue:one';
const TEST_QUEUE2 = 'test:queue:one';
const BAGIT_QUEUE = 'bagit:pingesta:ingestfolder';


const TEST_STATUS_OK_one = 'taskOK:ONE';
const TEST_STATUS_OK_two = 'taskOK:TWO';
const TEST_STATUS_ERROR = 'taskERROR::';

async function _testExecutorFn1(job){
    let task = job.data
    let promise = new Promise((res, rej)=> {
        setTimeout(()=>{
            task.status = TEST_STATUS_OK_one;
            res(task.status);
        }, 50000);

    })
    return promise;
}

async function _testExecutorFn2(job){
    let task = job.data
    let promise = new Promise((res, rej)=> {
        setTimeout(()=>{
            task.status = TEST_STATUS_OK_two;
            res(task.status);
        }, 20000);

    })
    return promise;
}

async function _baggitExecutorFn(job) {
    const bagitPromise = new Promise((resolve, rej)=> {
        let messageProducer = new Queue(MESSAGE_QUEUE);
        let task = job.data;
        let progress = 0;
        let progress_status = {
            progress: 0,
            status: '',
            queue: BAGIT_QUEUE,
            identifier: task.identifier,
            jobid: job.id
        };

        const server = utils.getServer(task.ingestFolder.server);
        let targetFolder = path.join( server.publicPath, server.serverPath, task.ingestFolder.path );
        job.progress(progress_status)


        const bagit = spawn('bagit.py', [targetFolder]);

        bagit.stdout.on('data', (data) => {
          progress += 100;
          progress_status.progress = progress;
          progress_status.status =  'stdout_in progress';
          //messageProducer.add({ ...progress_status })
          job.progress(progress_status)
        });

        bagit.stderr.on('data', (data) => {
            progress += 100;
            progress_status.progress = progress;
            progress_status.status =  'stderr in progress';
            messageProducer.add({ ...progress_status })
            job.progress(progress_status)
        });

        bagit.on('close', (code) => {
          if(code){
            task.status = ERROR_STATUS + code;

          }else {
            task.status = OK_STATUS;
          }

          progress_status.progress = 999999;
          progress_status.status =  task.status;
          messageProducer.add({ ...progress_status })
          job.progress(progress_status)

          resolve(task.status);
        });

    })
    return bagitPromise;

}




// queue instance has 3 roles: job producer / job consumer / events listener;
// producer: adds jobs to queue
// consumer OR worker, are the consumers, consumes jobs in FIFO order.
async function triggerTestQueue(errcb, cb){
    //c onsole.log('========== testQueue BEGIN =================')

    let tqueue1 = new Queue(TEST_QUEUE1);
    // _addTestListener(tqueue1);
    // _registerTestWorker(tqueue1, _testExecutorFn1);

    // setTimeout(()=> {
    //     _producerNewJobTriggered(tqueue1)
    // }, 5000);


    let messageQueue = new Queue(MESSAGE_QUEUE);
    _addMessageListener(messageQueue);
    _registerMessageReceiver(messageQueue)


    // BAGIT
    let baggitQueue = new Queue(BAGIT_QUEUE);
    _addTestListener(baggitQueue);
    _registerBaggitWorker(baggitQueue, _baggitExecutorFn);

    setTimeout(()=> {
        _producerNewBaggitJobTriggered(baggitQueue)
    }, 5000);

    cb({status:'started'});
}

async function _producerNewBaggitJobTriggered(queue){
    //c onsole.log('PRODUCER: NEW BAGGIT TASK TRIGGERED==================TEST_QUEUE==============')

    let task = {
        ingestFolder: {
            server: 'ingesta',
            path: '/workdir/cc_0025'
        },
        status: 'init',
        target: 'testbagit',
        identifier: 'abc1234'
    }
    const job = await queue.add(task)
}

async function _producerNewJobTriggered(tqueue){

    let task = {
        status: 'init',
        target: 'test: dummy task'
    }
    const job = await tqueue.add(task)
}

function _addTestListener(queue){
    queue.on('completed', (job, result) => {
        // c onsole.log('------------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><')
        // c onsole.log(`completed LISTENER EMITS: result:[${result}]  ${job.id}`);
        // c onsole.log('---------------------------------------------------------')
    })
}

function _addMessageListener(queue){
    queue.on('completed', (job, result) => {
        //c onsole.log('--------message queue CLOSED')
    })
}

function _registerTestWorker(queue, executorFn){
    queue.process(async (job, done) => {
        let result = await executorFn(job);
        done(null, result);

    })
}


function _registerMessageReceiver(queue){
    queue.process(async (job, done) => {
        //c onsole.log('ProgressMessage received -->[%o]', job.data.progress);
        done();
    })
}

function _registerBaggitWorker(queue, executorFn){
    queue.process(async (job) => {
        let result = await executorFn(job);
        return result;
    })
}


