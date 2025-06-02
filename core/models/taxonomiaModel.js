const mongoose = require('mongoose');
const TaxonomiaTerminoModel = require('./taxonomiaTerminoModel');

// Definición de modelos
const taxonomiaAuditSch = new mongoose.Schema({
  fechaAltaTx: { type: String, required: false, default: '' },
  fechaAltaTs: { type: Number, required: false, default: null },
  userId:      { type: String, required: false, default: '' },
  userName:    { type: String, required: false, default: '' }
});


const taxonomiaSch = new mongoose.Schema({
  identificador:            { type: String,            required: false, default: '' },
  descripcion:              { type: String,            required: false, default: '' },
  slug:                     { type: String,            required: false, default: '' },
  isLocked:                 { type: Boolean,           required: false, default: false },
  canCreateOnTheFly:        { type: Boolean,           required: false, default: false },
  audit:                    { type: taxonomiaAuditSch, required: false, default: {} }
});



const Record = mongoose.model('Taxonomia', taxonomiaSch, 'taxonomias');


// API - Taxonomias
exports.create = async (data) => {
  try {
    delete data._id;
    return await Record.create(data);
  } catch(error) {
    throw new error;
  }
}

exports.update = async (id, data) => {
  try {
    return await Record.findByIdAndUpdate(id, data, { new: true });
  } catch(error) {
    throw new error;
  }
}

exports.delete = async (id) => {
  try {
    return await Record.findByIdAndDelete(id);
  } catch(error) {
    throw new error;
  }
}

exports.findById = async (id) => {
  try {
    return await Record.findById(id).lean().exec();
  } catch(error) {
    throw new error;
  }
}

exports.findAll = async () => {
  try {
    return await Record.find().lean().exec();
  } catch(error) {
    throw new error;
  }
}

exports.findByQuery = async (query) => {
  try {
    const q = _buildQuery(query);
    return await Record.find(q).lean().exec();
  } catch(error) {
    throw new error;
  }
}

exports.esSinonimoUnicoEnTaxonomia = async (taxonomiaId, sinonimos) => {
  /*
    Algo:

    1) Leer todos los terminos donde taxonomiaId = taxonomiaId (param)
      1.1) Y: Que en su array de sinonimos tengan a sinonimos (param)
    2) Si hay al menos un resultado, entonces retorno false (no es unique)
      2.1) Si no hay ningun resultado, entonces retorno true (es unique)

    Fin
  */
  try {
    const entities = await TaxonomiaTerminoModel.getMongooseModel().find({ taxonomiaId, sinonimos }).lean().exec();
    return !(entities && entities.length > 0);
  } catch (error) {
    throw new error;
  }
}

// Funciones helper - Lógica de negocios
function _buildQuery(query) {
  let q = {};

  if (query.identificador) {
    if (query.exact && query.exact === 'false')
      q['identificador'] = { "$regex": query.identificador , '$options': 'ig'};
    else
      q['identificador'] = query.identificador;
  }

  return q;
}
