const whoami = "services/ingestaWorkflowService";

const path = require('path');
const fs = require('fs');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const config = require('../config/config');


const ipModule = require('../models/ingestProcessModel');
const assetModule = require('../models/assetModel');
const udaModule = require('../models/unidadDescripcionModel');
const { updateTypeAssertion, getTsBuildInfoEmitOutputFilePath } = require("typescript");
const { promise } = require("protractor");
const { fstat } = require('fs');

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



/////////   API /////////////
exports.updateWorkflow = workflowUpdate




/////////   CAPA DE SERVICIOS /////////////

function workflowUpdate(action, pi, errcb, cb){

    if(action === 'aprobado'){
        workflowTransitionToApproved(action, pi, errcb, cb)
    }

    if(action === 'manifiesto'){
        workflowTransitionToManifiesto(action, pi, errcb, cb)
    }

}

function workflowTransitionToManifiesto(action, pi, errcb, cb){
    let promiseArr = [];

    promiseArr.push(_writeManifiesto(pi));


    Promise.all(promiseArr).then((values)=>{
       _updateIngestProcess(pi).then(record => {
            if(record){
                cb(record);
            }else {
                cb(pi);
            }
        })

    })
}

function workflowTransitionToApproved(action, pi, errcb, cb){
    let promiseArr = [];

    promiseArr.push(_processAsseList(pi.assetHookList, pi));

    promiseArr.push(_processUdaList(pi.assetHookList));


    Promise.all(promiseArr).then((values)=>{
       _updateIngestProcess(pi).then(record => {
           if(record){
               cb(record);
           }else {
               cb(pi);
           }
       })
   })
}


function _updateIngestProcess(pi){
    let promise = new Promise(async (resolve, reject)=>{

        pi = await ipModel.findByIdAndUpdate(pi._id, pi, {new: true}).exec();
        resolve(pi);

    })
    return promise;
}


function _writeManifiesto(pi){
    let promise = new Promise(async (resolve, reject)=>{
        let ingestFolder = pi.ingestFolder;
        ingestFolder.isBaggit = false;
        ingestFolder.isLocked = true;

        let targetPath = path.join(publicPath, ingestFolder.serverPath, ingestFolder.rootPath, 'manifiesto-gdoc.json');
        const content = { ...pi };
        content.assetList=[];
        let contentTxt = JSON.stringify(content);

        try {
            fs.writeFileSync(targetPath, contentTxt);
            resolve(true);
        }catch(err){
            console.error(err);
            reject(new Error(err));
        }
    })

    return promise;
}

function _processUdaList(assetHookList){
    let promise = new Promise(async (resolve, reject)=>{
        if(!(assetHookList && assetHookList.length)) resolve(true);

        for(let index=0; index < assetHookList.length; index ++){
            await _updateUda(assetHookList[index]);
        }
        resolve(true);

    })
    return promise;
}

function _updateUda(assetHook){
    return udaModel.findById(assetHook.itemId).exec().then(uda => {
        let assetPredicate = new AssetPredicate(assetHook);
        let assets =( (uda.assets || []).filter(as => as.entityId !== assetPredicate.entityId)) || [];
        assets.push(assetPredicate);
        uda.assets = assets;

        return udaModel.findByIdAndUpdate(assetHook.itemId, uda).exec();
    })

}

function  _processAsseList(assetHookList, pi){
    let assetList = [];
    let promise = new Promise(async (resolve, reject)=>{
        if(!(assetHookList && assetHookList.length)) resolve(true);

        for(let index=0; index < assetHookList.length; index ++){
            let assetHook = assetHookList[index];

            let asset = await assetModel.findById(assetHook.assetId).lean().exec();

            asset = _updateAsset(asset);
            console.log('update Asset: [%s] [%s] [%s]', asset.bundlePath, asset.filename, asset.path);
            await assetModel.findByIdAndUpdate(asset._id, asset, {new: true}).exec();
            assetList.push(asset)
        }
        pi.assetList = assetList;
        resolve(true);
    })
    return promise;
}


function _updateAsset(asset){
        asset.isBaggit = true;
        asset.isUploaded = true;
        if(asset.bundlePath && !asset.isRootFolder){
            let oldPath = path.join(publicPath, asset.serverPath, asset.rootPath, asset.bundlePath);
            let newPath = path.join(publicPath, asset.serverPath, asset.rootPath, setNormalizedFileName(asset.bundlePath, asset));

            asset.bundlePath = path.join('data', setNormalizedFileName(asset.bundlePath, asset));
            asset.filename = setNormalizedFileName(asset.filename, asset)
            asset.path = path.join ("/" , asset.rootPath, asset.bundlePath);


            if(asset.fileType === FILETYPE_FILE){
                fs.renameSync(oldPath, newPath)
            }

        }
        return asset;
}

const es_cutoff = {
    "á" : "a",
    "Á" : "A",
    "é" : "e",
    "É" : "E",
    "í" : "i",
    "Í" : "I",
    "ó" : "o",
    "Ó" : "O",
    "ú" : "u",
    "Ú" : "U",
    "ñ" : "n"
};

function setNormalizedFileName(filename, asset){
    if(!filename) return 'file-name-error';

    // no se renombran las carpetas
    if (asset.fileType === FILETYPE_DIRECTORY) return filename;

    if(filename.indexOf(asset._id) !== -1) return filename;

    let parsed = path.parse(filename);
    return  path.join( parsed.dir, safeFileName(parsed.name) + "-" + asset._id + parsed.ext);
};

function safeFileName(name){
  let str = name;
  str = str.split(' ').join('_');
  str = str.replace(/[áÁéÉíÍóÓúÚñ]/g,function(c) { return es_cutoff[c]; });
  return str;
};

class AssetPredicate {
    entity;
    displayAs;
    predicate;
    slug;
    description;
    avatar = '';
    entityId;
    mimetype = '';
    constructor(assetHook){
        this.entity = assetHook.assetType;
        this.displayAs = assetHook.assetName;
        this.predicate = assetHook.itemRole;
        this.slug = assetHook.assetFilename;
        this.description = 'Ingestado el ' + new Date().toString();
        this.entityId = assetHook.assetId;
    }


}
