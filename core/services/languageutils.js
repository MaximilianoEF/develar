/**
 * Este archivo contiene funciones afectadas al manejo de idiomas, como por ejemplo conversión entre normas ISO
 *
 */

const languageToISO639Mapping = {
  'español': 'es',
  'inglés': 'en',
  'francés': 'fr',
}

const languageToISO15924Mapping = {
  'la': 'Latn',
  'latín': 'Latn',
}

exports.convertISO15924ToLanguageName = (iso) => {
  if(!iso || iso === '') {
    return null;
  }

  const normalized = _normalize(iso);
  const exists = Object.values(languageToISO15924Mapping).includes(normalized);

  let retorno = iso;

  if(exists) {
    retorno = Object.keys(languageToISO15924Mapping)
      .find(key => _normalize(languageToISO15924Mapping[key]) === normalized)
  }

  return retorno;
}


exports.convertLanguageNameToISO639 = (language) => {
  if (!language || language === '') {
    return null;
  }

  const normalized = _normalize(language);
  const exists = Object.keys(languageToISO639Mapping).includes(normalized);

  let retorno = language;

  if (exists) {
    retorno = languageToISO639Mapping[normalized];
  }

  return retorno;
}

exports.convertLanguageNameToISO15924 = (language) => {
  if (!language || language === '') {
    return null;
  }

  const normalized = _normalize(language);
  const exists = Object.keys(languageToISO15924Mapping).includes(normalized);

  let retorno = language;

  if (exists) {
    return languageToISO15924Mapping[normalized];
  }

  return retorno;
}

function _normalize(language) {
  if (!language || language === '') {
    return null;
  }

  const normalized = language.toLowerCase();

  return normalized;
}
