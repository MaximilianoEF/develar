const fetch = require('node-fetch');
const APIKEY_ATOM_GESTION_DOC = 'c6eaaa3dec434d8d';  //API KEY de usuario GestionDOC
const url = 'https://atom.mininterior.gob.ar/api/informationobjects';

const fetchOpts = {
  method: 'GET',
  headers: { 'Content-Type': 'application/json', 'REST-API-Key': APIKEY_ATOM_GESTION_DOC }
};

exports.getInformationObjects = function () {
  return fetch(url, fetchOpts);
};


exports.getInformationObjectsSkip = function (skip) {
  return fetch(`${url}?skip=${skip}`, fetchOpts);
};


exports.getInformationObject = function (slug) {
  return fetch(`${url}/${slug}`, fetchOpts);
};

