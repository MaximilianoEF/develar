/*
 *  core utils.js
 *  package: /core/service/commons.utils
 *  Use:
 *     Exporta un objeto con funciones utilitarias
 */
const config = require('../config/config');
const Prism = require('prismjs');
const crypto = require('crypto');

const fs = require('fs');
const {mimeTypeOptList} = require("../optlists");


const es_cutoff = {
  "á": "a",
  "Á": "A",
  "é": "e",
  "É": "E",
  "í": "i",
  "Í": "I",
  "ó": "o",
  "Ó": "O",
  "ú": "u",
  "Ú": "U",
  "ñ": "n"
};

const es_stringify_cutoff = {
  "á": "a",
  "Á": "A",
  "é": "e",
  "É": "E",
  "í": "i",
  "Í": "I",
  "ó": "o",
  "Ó": "O",
  "ú": "u",
  "Ú": "U",
  "ñ": "n",
  ".": " ",
  ",": " ",
  ":": " ",
  ";": " ",
  "[": " ",
  "]": " ",
  "(": " ",
  ")": " ",
  "\"": " ",
  "-": " ",
  "*": " ",
};

const es_vowels_diacritic_regexp = {
  'a': '[áaä]',
  'e': '[éeë]',
  'i': '[íiï]',
  'o': '[óoö]',
  'u': '[úuü]',
  'á': '[á]',
  'é': '[é]',
  'í': '[í]',
  'ó': '[ó]',
  'ú': '[ú]'
};

const es_vowels_point_regexp = {
  'a': '.',
  'e': '.',
  'i': '.',
  'o': '.',
  'u': '.',
  'á': '[á]',
  'é': '[é]',
  'í': '[í]',
  'ó': '[ó]',
  'ú': '[ú]'
  // 'á': '.',
  // 'é': '.',
  // 'í': '.',
  // 'ó': '.',
  // 'ú': '.'
};

const bgImages = [
  '/css/img/bg-001.jpg',
  '/css/img/bg-002.jpg',
  '/css/img/bg-003.jpg',
  '/css/img/bg-004.jpg',
  '/css/img/bg-005.jpg',
  '/css/img/bg-006.jpg',
  '/css/img/bg-007.jpg',
  '/css/img/bg-008.jpg',
  '/css/img/bg-009.jpg',
  '/css/img/bg-010.jpg',
  '/css/img/bg-011.jpg',
];

const rndBetween = function (min, max) {
  //min: inclusive  max: exclusive
  return Math.floor(Math.random() * (max - min) + min);

  //min: inclusive  max: inclusive
  //return Math.floor(Math.random() *(max - min + 1) + min);
};

const safeFileName = function (name) {
  let str = name;
  str = str.split(' ').join('_');
  str = str.replace(/[áÁéÉíÍóÓúÚñ]/g, function (c) {
    return es_cutoff[c];
  });
  return str;
};

const createFolder = function (publicPath, today) {
  let day = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
  let month = today.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  let year = today.getFullYear();

  let serverPath = 'storage'
  if (!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

  serverPath += '/assets';
  if (!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

  serverPath += '/' + year;
  if (!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

  serverPath += '/' + month;
  if (!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

  serverPath += '/' + day;
  if (!fs.existsSync(publicPath + serverPath)) fs.mkdirSync(publicPath + serverPath);

  return serverPath;
};

const rutas = {
  'no_definido': '/#navegar/proyectos',
  'procedencias:list': '/#navegar/proyectos',
  'solicitudes:list': '/#navegar/solicitudes',
  'productos:list': '/#navegar/productos',
  'gestion:comprobantes:list': '/gestion/#comprobantes',
  'sisplan:acciones:list': '/sisplan/#acciones',
  'studio:producciones:list': '/studio',
  'mica:rondas': '/mica',
  'fondo:inscripcion': '/fondo/#inscripcion/nueva'
};


exports.getBgImage = function () {
  let index = rndBetween(0, bgImages.length);
  //console.log('getBgImate: index:[%s] l:[%s]',index, bgImages.length);
  return bgImages[index];
};


/**
 * Devuelve una cadena de caracteres con el tipo MIME para el archivo pasado por parámetro.
 * Requiere usa el comando 'file', por lo tanto sólo funciona bajo sistemas corriendo GNU/Linux
 *
 * @param pathToFile La ruta del archivo del que se quiere obtener el tipo MIME
 * @returns string
 */
exports.getMimeType = function(pathToFile) {
  if (!pathToFile) return '';

  const execSync = require('child_process').execSync;
  return execSync('file --mime-type -b "' + pathToFile + '"').toString().trim();
}


exports.getAssetTypeForMimeType = function(mimeType) {
  const found = mimeTypeOptList.find(item => item.val === mimeType);
  return (found ? found.type : 'no_definido');
}



exports.userHome = function (user) {
  let location;
  if (user) {
    if (user.home) {
      location = rutas[user.home];
    }
  }
  return (location ? location : rutas['no_definido'])
};


const normalizeSpaces = function (str) {
  str = str.replace(/[\s]+/g, ' ');
  return str;
}

exports.safeStringify = function (name) {
  if(!name) return '';
  if( typeof name !== 'string') return name;

  let str = name.toLowerCase();
  str = str.replace(/[áÁéÉíÍóÓúÚñ,\.\(\)\[\]\-\*:;"]/ig, function (c) {
    return es_stringify_cutoff[c];
  });
  str = str.replace(/<[^>]*>/g, ' ');
  str = normalizeSpaces(str);
  return str;
};

exports.buildVowelsRegexp = function (word) {
  let str = word.toLowerCase();
  str = str.replace(/[áéíóúäëïöüaeiou]/ig, function (c) {
    return es_vowels_diacritic_regexp[c];
  });
  return str;
}

exports.buildVowelsSingleWord = function (word) {
  let str = word.toLowerCase();
  str = str.replace(/[áéíóúaeiou]/ig, function (c) {
    return es_vowels_point_regexp[c];
  });
  return str;
}

exports.buildMultiWord = function (sentence) {
  let str = sentence.toLowerCase();
  let joined = str.split(' ').join('.*');
  return joined;
  // return splitted.join('.*');
}


exports.normalizeSpaces = function (sentence) {
  return normalizeSpaces(sentence);
}

exports.safeName = function (name) {
  let str = name.toLowerCase();
  str = str.split(' ').join('-');
  str = str.replace(/[áÁéÉíÍóÓúÚñ]/g, function (c) {
    return es_cutoff[c];
  });
  return str;
};

exports.safeTextSearch = function (name) {
  let str = name.toLowerCase();
  str = str.replace(/[áÁéÉíÍóÓúÚñ]/g, function (c) {
    return es_cutoff[c];
  });
  return str;
};

exports.safeAddressTokenized = function (name, token) {
  let str = name.toLowerCase();
  str = str.split(' ').join(token);
  str = str.replace(/[áÁéÉíÍóÓúÚñ]/g, function (c) {
    return es_cutoff[c];
  });
  return str;
};

exports.safeAddress = function (name) {
  let str = name.toLowerCase();
  str = str.split(' ').join('%20');
  str = str.replace(/[áÁéÉíÍóÓúÚñ]/g, function (c) {
    return es_cutoff[c];
  });
  return str;
};

exports.moveFile = function (req, res, next, rootPath) {
  let today = new Date();
  let times = today.getTime();
  let times_str = times.toString() + '_';

  let filename = safeFileName(req.files.loadfiles.name);

  let publicPath = config.publicPath;

  let urlPath = createFolder(publicPath, today) + '/' + times_str + filename;

  let serverPath = config.publicPath + urlPath;

  //console.log("req.body: "+JSON.stringify(req.body));
  //console.log("req.files: "+JSON.stringify(filename));

  fs.rename(req.files.loadfiles.path, serverPath, function (error) {
    if (error) {
      res.send({error: 'Ooops! algo salio mal!'});
    } else {
      res.send({
        name: filename,
        urlpath: urlPath,
        fileversion: {
          name: filename,
          urlpath: urlPath,
          mime: req.files.loadfiles.mime,
          type: req.files.loadfiles.type,
          size: req.files.loadfiles.size,
          lastModifiedDate: req.files.loadfiles.lastModifiedDate,
          uploadDate: times
        }
      });
    }
  });
};

exports.dateToStr = function (date) {
  let prefix = '00';

  let da = (prefix + date.getDate()).substr(-prefix.length);
  let mo = (prefix + (date.getMonth() + 1)).substr(-prefix.length);
  let ye = date.getFullYear();
  return da + "/" + mo + "/" + ye;
};

exports.getDeepValue = function (obj, path) {
  let parts = path.split('.'),
    rv,
    index;

  for (rv = obj, index = 0; rv && index < parts.length; ++index) {
    if (!(parts[index] in rv)) {
      return '';
    }
    rv = rv[parts[index]];
  }
  return rv;
};

const hl = function (match, p, offset) {

  return '<pre><code class="language-javascript">' + Prism.highlight(p, Prism.languages.javascript, 'javascript') + '</code></pre>';
};

const rg = /<pre><code.*?>((\s|\S)*?)<\/code><\/pre>/g;

exports.highlightCode = function (code) {


  let token = code.replace(rg, hl);

  //let token = Prism.highlight(code, Prism.languages.javascript, 'javascript');

  return token;
}

exports.parsePHPDateStr = function (str) {
  let mx = str.match(/(\d+)/g);
  if (mx && mx.length === 3) {
    if (mx[0] > 2030 || mx[0] < 1900) mx[0] = 1900;
    if (mx[1] > 12 || mx[1] < 1) mx[1] = 1;
    if (mx[2] > 31 || mx[1] < 1) mx[2] = 1;
    return (this.parseDateStr(mx[2] + '/' + mx[1] + '/' + mx[0]));
  } else if (mx && mx.length === 2) {
    if (mx[0] > 2030 || mx[0] < 1900) mx[0] = 1900;
    if (mx[1] > 12 || mx[1] < 1) mx[1] = 1;
    return (this.parseDateStr('1' + '/' + mx[1] + '/' + mx[0]));
  } else if (mx && mx.length === 1) {
    if (mx[0] > 2030 || mx[0] < 1900) mx[0] = 1900;
    return (this.parseDateStr('1' + '/' + '1' + '/' + mx[0]));
  } else {
    return new Date();
  }
}

exports.parsePHPTimeStamp = function (str) {
  let mx = str.match(/(\d+)/g);
  if (mx && mx.length >= 3) {
    let ts = this.parseDateStr(mx[2] + '/' + mx[1] + '/' + mx[0]);
    if (ts) return ts.getTime();
  }
  return Date.now();
}

exports.projectedDate = function (date, plus_day, plus_month) {
  plus_day = plus_day || 0;
  plus_month = plus_month || 0;

  if (plus_day) {
    date.setMonth(date.getMonth() + plus_month, date.getDate() + plus_day);

  } else {
    date.setMonth(date.getMonth() + plus_month, 0);

  }
  return date;
}

exports.calcularEdad = function (dob_number) {
  if (!dob_number) return 0;
  let diff_ms = Date.now() - dob_number;
  let age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
}

exports.edadActual = function (dob) {
  if (!dob) return null;
  let diff_ms = Date.now() - dob.getTime();
  let age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
}


exports.parseDateStr = function (str) {
  //console.log('parseDate BEGIN [%s]',str)
  if (!str) return null;

  let mx = str.match(/(\d+)/g);
  if (!mx) return null;

  let ty = new Date();
  if (mx.length === 0) return ty;
  if (mx.length === 1) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    else return new Date(ty.getFullYear(), ty.getMonth(), mx[0]);
  }
  if (mx.length === 2) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    if (mx[1] < 0 || mx[1] > 12) return null;
    else return new Date(ty.getFullYear(), mx[1] - 1, mx[0]);
  }
  if (mx.length === 3) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    if (mx[1] < 0 || mx[1] > 12) return null;
    if (mx[2] < 1000 || mx[2] > 2100) return null;
    else return new Date(mx[2], mx[1] - 1, mx[0]);
  }
  if (mx.length === 4) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    if (mx[1] < 0 || mx[1] > 12) return null;
    if (mx[2] < 1000 || mx[2] > 2100) return null;
    if (mx[3] < 0 || mx[3] > 24) return null;
    else return new Date(mx[2], mx[1] - 1, mx[0], mx[3], 0);
  }
  if (mx.length === 5) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    if (mx[1] < 0 || mx[1] > 12) return null;
    if (mx[2] < 1000 || mx[2] > 2100) return null;
    if (mx[3] < 0 || mx[3] > 24) return null;
    if (mx[4] < 0 || mx[4] > 60) return null;
    else return new Date(mx[2], mx[1] - 1, mx[0], mx[3], mx[4]);
  }
}


exports.dateNumFromTx = function (datex) {
  let fecha = this.parseDateStr(datex);
  if (fecha) return fecha.getTime();
  else return 0;
}

exports.longStrFromNum = function (ts) {
  const fecha = new Date(ts);
  const opts = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
  return fecha.toLocaleDateString("es-AR", opts);
}

exports.strFromDateInterval = function (inicio, unidad, cantidad) {
  const fechainicio = new Date(inicio);
  const nuevafecha = sumarAFecha(fechainicio, unidad, cantidad);
  return txFromHora(fechainicio) + ' a ' + txFromHora(nuevafecha);
}

exports.txFromHora = function (date) {
  return txFromHora(date);
}

function txFromHora(date) {
  let horario = {
    hora: date.getHours(),
    minutos: date.getMinutes() < 10 ?
      '0' + date.getMinutes() : date.getMinutes().toString()
  }

  return horario.hora + ':' + horario.minutos;
}

function sumarAFecha(inicio, queSumo, unidades) {
  if (!(inicio instanceof Date))
    return null;

  var nuevafecha = new Date(inicio);

  var checkRollover = function () {
    if (nuevafecha.getDate() != inicio.getDate())
      nuevafecha.setDate(0);
  }

  switch (String(queSumo).toLowerCase()) {
    case 'year':
      nuevafecha.setFullYear(nuevafecha.getFullYear() + unidades);
      checkRollover();
      break;
    case 'month':
      nuevafecha.setMonth(nuevafecha.getMonth() + unidades);
      checkRollover();
      break;
    case 'day':
      nuevafecha.setDate(nuevafecha.getDate() + unidades);
      break;
    case 'hour':
      nuevafecha.setTime(nuevafecha.getTime() + unidades * 3600000);
      break;
    case 'minute':
      nuevafecha.setTime(nuevafecha.getTime() + unidades * 60000);
      break;
    case 'second':
      nuevafecha.setTime(nuevafecha.getTime() + unidades * 1000);
      break;
    default:
      nuevafecha = null;
      break;
  }

  return nuevafecha;
}

exports.buildDateFrameForCurrentWeek = function (fecha_time) {
  let fecharef = new Date(fecha_time);

  fecharef.setHours(0, 0, 0, 0);

  let dayOfWeek = fecharef.getDay(); // 0-6 <==> DOM-SAB
  let actualDay = fecharef.getDate(); // Día del mes calendario 1-31|30|28|29

  let semana_inicia = actualDay - dayOfWeek + ((dayOfWeek === 0) ? -6 : 1);
  let semana_finaliza = actualDay + (6 - dayOfWeek) + ((dayOfWeek === 0) ? -6 : 1);

  let sem_desde = new Date(fecharef.getTime());
  sem_desde.setDate(semana_inicia);

  let sem_hasta = new Date(fecharef.getTime());
  sem_hasta.setDate(semana_finaliza)

  let anio_desde = new Date(sem_desde.getFullYear(), 0, 1);

  sem_desde.setHours(0, 0, 0, 0);
  sem_hasta.setHours(23, 0, 0, 0);

  return {
    fecharef: fecharef,
    semd: sem_desde,
    semh: sem_hasta,
    begin: anio_desde
  }
}


/* For a given date, get the ISO week number
 *
 * Based on information at:
 *
 *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 *
 * Algorithm is to find nearest thursday, it's year
 * is the year of the week number. Then get weeks
 * between that date and the first day of that year.
 *
 * Note that dates in one year can be weeks of previous
 * or next year, overlap is up to 3 days.
 *
 * e.g. 2014/12/29 is Monday in week  1 of 2015
 *      2012/1/1   is Sunday in week 52 of 2011
 */
function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}

exports.parseDateStr = function (str) {
  if (!str) return null;
  let mx = str.match(/(\d+)/g);
  let ty = new Date();
  if (mx.length === 0) return ty;
  if (mx.length === 1) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    else return new Date(ty.getFullYear(), ty.getMonth(), mx[0]);
  }
  if (mx.length === 2) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    if (mx[1] < 0 || mx[1] > 12) return null;
    else return new Date(ty.getFullYear(), mx[1] - 1, mx[0]);
  }
  if (mx.length === 3) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    if (mx[1] < 0 || mx[1] > 12) return null;
    if (mx[2] < 1000 || mx[2] > 2100) return null;
    else return new Date(mx[2], mx[1] - 1, mx[0]);
  }
  if (mx.length === 4) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    if (mx[1] < 0 || mx[1] > 12) return null;
    if (mx[2] < 1000 || mx[2] > 2100) return null;
    if (mx[3] < 0 || mx[3] > 24) return null;
    else return new Date(mx[2], mx[1] - 1, mx[0], mx[3], 0);
  }
  if (mx.length === 5) {
    if (mx[0] < 0 || mx[0] > 31) return null;
    if (mx[1] < 0 || mx[1] > 12) return null;
    if (mx[2] < 1000 || mx[2] > 2100) return null;
    if (mx[3] < 0 || mx[3] > 24) return null;
    if (mx[4] < 0 || mx[4] > 60) return null;
    else return new Date(mx[2], mx[1] - 1, mx[0], mx[3], mx[4]);
  }
}


/** Funciones afectadas al parseo de datos enviados por AtoM */

/**
 * A partir de una cadena enviada por AtoM, crear una fecha.
 * El formato es: YYYY-MM-DD
 */
exports.parseAtomDateStr = function (str) {
  function isValidYear(yx) {
    return (yx > 1000 &&  yx < 2100)
  }
  function isValidMonth(mx){
    return (mx > 0 && mx <= 12)
  }
  function isValidDay(dx){
    return (dx > 0 && dx <= 31)
  }

  if (!str) return null;

  let mx = str.match(/(\d+)/g); //.filter(item => item > 0);


  if (!(mx && mx.length)) {
    return null;
  }

  mx = mx.filter(item => item > 0);

  if(mx.length === 0) return null;

  // Sólo YYYY
  if (mx.length === 1) {
    if (isValidYear(mx[0]) ) {
      return new Date(mx[0], 0, 1);
    } else {
      return null;
    }
  }

  // YYYY-MM
  if (mx.length === 2) {
    if(isValidYear(mx[0]) && isValidMonth(mx[1])){
      return new Date(mx[0], mx[1] - 1, 1);

    }else {
      return null;
    }
  }

  // YYYY-MM-DD
  if (mx.length === 3) {

    if(isValidYear(mx[0]) && isValidMonth(mx[1]) && isValidDay(mx[2])  ){
      return new Date(mx[0], mx[1] - 1, mx[2]);

    }else {
      return null;
    }
  }
}

exports.getAtomSignificantDate = function(str) {
  if (!str) return null;

  const mx = str.match(/(\d+)/g).filter(item => item > 0);
  const significantParts = [];

  if (mx.length > 0) {
    mx.forEach((item) => significantParts.push(item));
  }

  return significantParts.join('-');
}

/**
 *
 */

/** optList para los tipos de idioma */
const idiomasOptList = [
  { val: 'en', label: 'English', atom: 'ingles' },
  { val: 'fr', label: 'Français', atom: 'frances' },
  { val: 'es', label: 'Español', atom: 'espanol' },
  { val: 'nd', label: 'Nederlands', atom: 'nederlands' },
  { val: 'pg', label: 'Português', atom: 'portugues' },
  { val: 'la', label: 'Latín', atom: 'latin' }
];


exports.mapAtomLanguageToGestionDoc = function(atomLanguage) {
  const cleanedLanguage = this.safeStringify(atomLanguage);

  const mapped = idiomasOptList.find(idioma => idioma.atom === cleanedLanguage);

  if (mapped) {
    return mapped.val;
  } else {
    return '';
  }
}

exports.getMD5Checksum = function(string) {
  const hash = crypto.createHash('md5');
  return hash.update(JSON.stringify(string), 'utf8').digest('hex');
}


exports.getServer = function(server) {
  return _getServerInfo(server);
}

function _getServerInfo(server) {
  const servers = config.serversAvailable;
  const serverObject = servers.find(t => t.val === server);

  return {
    server: serverObject.val,
    mountingPath: serverObject.mountingPath,
    publicPath: config[serverObject.mountingPath],
    serverPath: serverObject.serverPath
  }
}
