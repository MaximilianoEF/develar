const mongoose = require('mongoose');

const taxonomiaTerminoSch = new mongoose.Schema({
  identificador:           { type: String,   required: false, default: '' },
  slug:                    { type: String,   required: false, default: '' },
  descripcion:             { type: String,   required: false, default: '' },
  sinonimos:               { type: [String], required: false, default: [] },
  taxonomiaIdentificador:  { type: String,   required: false, default: '' },
  taxonomiaId:             { type: String,   required: false, default: '' },
  isLocked:                { type: Boolean,  required: false, default: false },
  canCreateOnTheFly:       { type: Boolean,  required: false, default: false },
  notasAlcance:            { type: String,   required: false, default: '' },
  notasOrigen:             { type: String,   required: false, default: '' },
  formaAbreviada:          { type: String,   required: false, default: '' },

  parentTermId:            { type: String,   required: false, default: '' },
  parentTermIdentificador: { type: String,   required: false, default: '' }

});


const Record = mongoose.model('TaxonomiaTermino', taxonomiaTerminoSch, 'taxonomiaterminos');
exports.getMongooseModel = () => { return Record };


// API - Taxonomía-Términos
exports.create = async function(data) {
  try {
    delete data._id;
    return await Record.create(data);
  } catch(error) {
    throw new error;
  }
}

exports.update = async function(id, data) {
  try {
    return await Record.findByIdAndUpdate(id, data, { new: true });
  } catch(error) {
    throw new error;
  }
}

exports.delete = async function(id) {
  try {
    return await Record.findByIdAndDelete(id);
  } catch(error) {
    throw new error;
  }
}

exports.findById = async function(id) {
  try {
    return await Record.findById(id).lean().exec();
  } catch(error) {
    throw new error;
  }
}

exports.findAll = async function() {
  try {
    return await Record.find().lean().exec();
  } catch(error) {
    throw new error;
  }
}

exports.findByQuery = async function(query) {
  try {
    const q = _buildQuery(query);
    return await Record.find(q).lean().exec();
  } catch(error) {
    throw new error;
  }
}


exports.breadcrumb = async function(idTaxonomiaTermino) {
  try {
    const breadcrumbArray = [];
    await _buildBreadcrumb(idTaxonomiaTermino, breadcrumbArray);
    return breadcrumbArray;
  } catch(error) {
    throw new error;
  }
}



// Funciones helper - Lógica de negocios
async function _buildBreadcrumb(id, breadcrumbArray) {
  try {
    const item = await Record.findById(id).lean().exec();
    // Item es un termino; si tiene parentTermId continuamos la búsqueda
    if (item) {
      if (item.parentTermId !== '') {
        await _buildBreadcrumb(item.parentTermId, breadcrumbArray);
        breadcrumbArray.push({ id: item._id, slug: item.slug });
      } else {
        breadcrumbArray.push({ id: item._id, slug: item.slug });
      }
    } else {
      return;
    }
  } catch(error) {
    throw new error;
  }
}

function _buildQuery(query) {
  let q = {};

  if (query.identificador) {
    if (query.exact && query.exact === 'false') {
      q['identificador'] = {"$regex": query.identificador, '$options': 'ig'};
    } else {
      q['identificador'] = query.identificador;
    }
  }

  if (query.taxonomiaId) {
    q['taxonomiaId'] = query.taxonomiaId;
  }

  if (query.parentTermId) {
    q['parentTermId'] = query.parentTermId;
  }

  return q;
}
