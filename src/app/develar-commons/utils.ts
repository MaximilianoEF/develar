import { FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

const monedas = [
  { val: 'ARS', label: 'pesos', slug: 'Pesos Argentinos' },
  { val: 'USD', label: 'usd', slug: 'Dolar USA' },
  { val: 'EUR', label: 'euros', slug: 'Euros' },
  { val: 'BRL', label: 'reales', slug: 'Reales' },
  { val: 'COP', label: 'pesosCo', slug: 'Pesos Colombianos' },
  { val: 'UYU', label: 'pesosUy', slug: 'Pesos Uruguayos' },
  { val: 'CLP', label: 'pesosCl', slug: 'Pesos Chilenos' },
]


const fumeList = [
  { val: 'no_definido', label: 'Unidad de Medida' },
  { val: 'unidad', label: 'UN' },
  { val: 'porcentaje', label: '%' },
  { val: 'hora', label: 'hs' },
  { val: 'dia', label: 'días' },
  { val: 'semana', label: 'sem' },
  { val: 'mes', label: 'mes' },
  { val: 'persona', label: 'per' },
  { val: 'espacio', label: 'amb' },
  { val: 'no_definido', label: '-------------' },
  { val: 'pasaje', label: 'pje' },
  { val: 'alojamiento', label: 'aloj' },
  { val: 'tramo', label: 'tram' },
];

const semana_labels = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const mes_labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatDDMMToStr = function (date_num) {
  let prefix = '00';

  let date = date_num ? new Date(date_num) : new Date();

  let da = (prefix + date.getDate()).substr(-prefix.length);

  let mo = date.getMonth();


  return da + '-' + mes_labels[mo];
};


const formatDateToStr = function (date_num) {
  let prefix = '00';

  let date = date_num ? new Date(date_num) : new Date();

  let da = (prefix + date.getDate()).substr(-prefix.length);
  let mo = (prefix + (date.getMonth() + 1)).substr(-prefix.length);
  let ye = date.getFullYear();

  let dayOfWeek = date.getDay()

  return semana_labels[dayOfWeek] + ' ' + da + '-' + mo;
};

const dateToStr = function (date) {
  let prefix = '00';
  date = date ? date : new Date();

  let da = (prefix + date.getDate()).substr(-prefix.length);
  let mo = (prefix + (date.getMonth() + 1)).substr(-prefix.length);
  let ye = date.getFullYear();
  return da + "/" + mo + "/" + ye;
};

const formattedDate = function (datex: string) {
  let date = parseDateStr(datex);
  return date ? dateToStr(date) : '';
}

const dateToInvertedStr = function (date) {
  let prefix = '00';
  date = date ? date : new Date();

  let da = (prefix + date.getDate()).substr(-prefix.length);
  let mo = (prefix + (date.getMonth() + 1)).substr(-prefix.length);
  let ye = date.getFullYear();
  return ye + '-' + mo + '-' + da;
};

const rangoFechasDocumento = {
  DNI: [
    { de: 100000, hasta: 9999999, nacido: '1/1/1920' },
    { de: 10000000, hasta: 13999999, nacido: '1/1/1950' },
    { de: 14000000, hasta: 19999999, nacido: '1/1/1960' },
    { de: 20000000, hasta: 24999999, nacido: '1/1/1970' },
    { de: 25000000, hasta: 29999999, nacido: '1/1/1975' },
    { de: 30000000, hasta: 34999999, nacido: '1/1/1980' },
    { de: 35000000, hasta: 39999999, nacido: '1/1/1990' },
    { de: 40000000, hasta: 44999999, nacido: '1/1/2001' },
    { de: 45000000, hasta: 99999999, nacido: '1/1/2010' },
  ]

}

const searchBestDoB = function (tdoc, ndoc): string {
  let fenac = '';
  let list = [];
  let token;
  let numdoc = parseInt(ndoc, 10);
  if (isNaN(numdoc)) numdoc = 0;

  if (tdoc && ndoc) {
    list = rangoFechasDocumento[tdoc];
    if (list && list.length) {
      token = list.find(t => t.de <= numdoc && numdoc <= t.hasta);
      fenac = token ? token.nacido : '';
    }

  }
  return fenac;
}

const parseDateStr = function (str) {
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


function umeTx(ume, fume, fumetx, qt, freq) {
  let text = ""
  if (freq === 1 && fume === 'unidad') {
    text = qt + ' ' + ume
  } else {
    text = qt + ' ' + ume + ' x ' + freq + ' ' + fumetx;
  }
  return text;
}

// si plus_day === 0, entonces devuelve la fecha de fin de mes, acorde al mes computado.
// si plus_day !== 0, entonces la suma, a modo de corrimiento, respecto del día actual.
function getProjectedDate(date: Date, plus_day: number, plus_month: number) {
  plus_day = plus_day || 0;
  plus_month = plus_month || 0;

  if (plus_day) {
    date.setMonth(date.getMonth() + plus_month, date.getDate() + plus_day);

  } else {
    date.setMonth(date.getMonth() + plus_month, 0);

  }
}

function buildFecharefLabel(fecharef: Date): string {
  let dayOfWeek = fecharef.getDay(); // 0-6 <==> DOM-SAB
  let actualDay = fecharef.getDate(); // Día del mes calendario 1-31|30|28|29

  let semana_inicia = actualDay - dayOfWeek + ((dayOfWeek === 0) ? -6 : 1);
  let semana_finaliza = actualDay + (6 - dayOfWeek) + ((dayOfWeek === 0) ? -6 : 1);

  let desde = new Date(fecharef.getTime())
  desde.setDate(semana_inicia);    // retorna fecha en formato number
  let hasta = new Date(fecharef.getTime())
  hasta.setDate(semana_finaliza);  // en milisegundos

  return `Semana referencia:  Lunes ${devutils.txFromDate(desde)} a Domingo ${devutils.txFromDate(hasta)}   `
}

function buildDateFromTo(fecharef: Date): { feDesde: string, feHasta: string } {
  let dayOfWeek = fecharef.getDay(); // 0-6 <==> DOM-SAB
  let actualDay = fecharef.getDate(); // Día del mes calendario 1-31|30|28|29

  let semana_inicia = actualDay - dayOfWeek;
  let semana_finaliza = actualDay + (6 - dayOfWeek);

  let desde = new Date(fecharef.getTime())
  desde.setDate(semana_inicia);    // retorna fecha en formato number

  let hasta = new Date(fecharef.getTime())
  hasta.setDate(semana_finaliza);  // en milisegundos
  return { feDesde: dateToStr(desde), feHasta: dateToStr(hasta) }
}

function buildEpidemioWeek(fecharef: Date): string {
  let dayOfWeek = fecharef.getDay(); // 0-6 <==> DOM-SAB
  let actualDay = fecharef.getDate(); // Día del mes calendario 1-31|30|28|29

  let semana_inicia = actualDay - dayOfWeek;
  let semana_finaliza = actualDay + (6 - dayOfWeek);

  let desde = new Date(fecharef.getTime())
  desde.setDate(semana_inicia);    // retorna fecha en formato number

  let hasta = new Date(fecharef.getTime())
  hasta.setDate(semana_finaliza);  // en milisegundos

  let week = getEpidemicWeekOfTheYear(fecharef)

  return `Semana epidemiológica #${week}:  Domingo ${devutils.txFromDate(desde)} a Sábado ${devutils.txFromDate(hasta)} `
}

function getEpidemicWeekOfTheYear(fecharef: Date): number {
  let weeks = 0;
  let from = fecharef.getTime();
  let firstOfYear_date = new Date(fecharef.getFullYear(), 0, 1);

  let begin_of_year = getBeginOfYear(new Date(fecharef.getFullYear() + 1, 0, 1));
  if (begin_of_year <= from) {
    return getEpidemioWeek(begin_of_year, from);
  }

  begin_of_year = getBeginOfYear(firstOfYear_date);

  if (begin_of_year > from) {
    begin_of_year = getBeginOfYear(new Date(fecharef.getFullYear() - 1, 0, 1));
  }

  return getEpidemioWeek(begin_of_year, from);
}

function getEpidemioWeek(begin, fecharef) {
  return Math.floor((fecharef - begin) / (1000 * 60 * 60 * 24 * 7)) + 1;
}

function getBeginOfYear(firstOfYear: Date): number {
  let dow = firstOfYear.getDay();
  let begin_of_year: number;

  //c onsole.log('FirstDayOfYear [%s] dow:[%s]', firstOfYear.toString(), dow);
  if (dow < 4) { // esta semana ya pertenece al año Nuevo
    begin_of_year = firstOfYear.setDate(firstOfYear.getDate() - dow)
    //c onsole.log('Semana Incluida: El año empezó el día [%s] [%s]', dow, new Date(begin_of_year).toString() );


  } else {
    begin_of_year = firstOfYear.setDate(firstOfYear.getDate() + (7 - dow));
    //c onsole.log('Semana siguiente El año empezó el día [%s] [%s]', dow, new Date(begin_of_year).toString() )
  }
  return begin_of_year;
}

// feriados
const inactivosList = ["31/03/2020", "10/04/2020", "01/05/2020", "25/05/2020", "15/06/2020", "09/07/2020", "10/07/2020"]
const laborDayOfWeek = [0, 1, 1, 1, 1, 1, 0]

function nextLaborDay(date: Date, offset): Date {
  let day = date.getDate();
  let m = date.getMonth();
  let y = date.getFullYear();
  let blackList = inactivosList.map(t => devutils.dateFromTx(t));

  for (let i = 0; i < 10; i += 1) {
    let dd = day + i + offset;
    let test = new Date(y, m, dd);
    if (laborDayOfWeek[test.getDay()]) {
      let inac = blackList.find(t => t.getTime() == test.getTime())
      if (!inac) return test;
    }
  }
  return null;

}

function timeOutOfScope(): boolean {
  let ok = false;
  let today = new Date();

  let d = today.getDate();
  let m = today.getMonth();
  let y = today.getFullYear();
  let test = new Date(y, m, d);

  let blackList = inactivosList.map(t => devutils.dateFromTx(t));
  let inac = blackList.find(t => t.getTime() === test.getTime())
  if (inac) ok = true;

  let hours = today.getHours();
  let dow = today.getDay()

  if ((hours >= 14 || hours < 8) || (dow < 1 || dow > 5)) {
    ok = true;

  }

  return ok;

}


class Devutils {

  get currencies() {
    return monedas;
  }

  get fumelist() {
    return fumeList;

  }

  /**
   * Recibe una fecha expresada en alguno de los formatos aceptados por ISAD(G)
   * y devuelve el timestamp correspondiente
   *
   * Pre: la fecha deberá estar en formato
   *  - YYYYMMDD, YYYY
   *  - YYYY-MM-DD ó YYYY-MM
   *
   * Post: devuelve el timestamp correspondiente a la fecha, o null
   * @param str la fecha que se quiere convertir a timestamp
   * @returns int | null
   */

  // TODO: revisar nombre de este método
  numFromISADGStr(str, isEndDate = false) {
    // Primero me fijo en qué formato está la fecha
    const parts = str.split('-');
    let dateObj = null;

    if (parts.length === 3) {
      // Está en formato ISO (YYYY-MM-DD)
      dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    } else if (parts.length === 2) { // YYYY-MM
      dateObj = new Date(parts[0], parts[1] - 1, 1);
    } else {
      // No es formato ISO; sino YYYYMMDD ó YYYY
      // en tal caso, podemos mirar la longitud de la cadena
      const longitud = str.length;

      if (longitud === 8) { // YYYYMMDD (año-mes-día sin espacios)
        const anio = str.substr(0, 4);
        const mes = str.substr(4, 2);
        const dia = str.substr(6, 2);

        dateObj = new Date(anio, mes - 1, dia);
      } else if (longitud === 4) { // YYYY (sólo año)
        if (isEndDate) {
          dateObj = new Date(str, 11, 31);
        } else {
          dateObj = new Date(str, 0, 1);
        }
      }
    }

    if (dateObj) {
      return dateObj.getTime();
    } else {
      return null;
    }
  }

  dateFromTx(datex) {
    return parseDateStr(datex);
  }

  dateNumFromTx(datex) {
    let fecha = parseDateStr(datex);
    if (fecha) return fecha.getTime();
    else return 0;
  }

  dateNumPlusOneFromTx(datex) {
    let fecha = parseDateStr(datex);
    if (fecha) {
      fecha.setDate(fecha.getDate() + 1);
      return fecha.getTime();
    }
    else return 0;
  }

  txFromDate(date) {
    return dateToStr(date);
  }

  txFromHora(date) {
    let horario = {
      hora: date.getHours(),
      minutos:
        date.getMinutes() < 10
          ? '0' + date.getMinutes()
          : date.getMinutes().toString()
    }

    return horario.hora + ':' + horario.minutos;
  }

  txInvertedFromDate(date) {
    return dateToInvertedStr(date);
  }

  txFormatted(datex) {
    return formattedDate(datex);
  }

  txDayFormatFromDate(date_num) {
    return formatDateToStr(date_num);
  }

  txDayMonthFormatFromDateNum(date_num) {
    return formatDDMMToStr(date_num);
  }

  txFromDateTime(time: number) {
    return dateToStr(new Date(time));
  }

  datePickerToTx(datepickerTx: string) {
    return dateToStr(new Date(datepickerTx));
  }

  datePickerToDate(datepickerTx) {
    let date: Date | typeof NaN;

    try {
      date = new Date(datepickerTx);
      return (date instanceof Date && !isNaN(date.getTime())) ? date : null;
    } catch (error) {

      return null;
    }
  }

  datePickerToNumPlusOne(datepickerTx) {
    //let fecha = parseDateStr(dateToStr(new Date(datepickerTx)) );
    let fecha = new Date(datepickerTx);
    // c onsole.log('fecha: [%s]',fecha.getTime())
    if (fecha) {
      fecha.setDate(fecha.getDate() + 1);
      return fecha.getTime();
    }
    else return 0;


    return new Date(datepickerTx).getTime();
  }

  datePickerToNum(datepickerTx) {
    return new Date(datepickerTx).getTime();
  }

  dateWeekFromTo(fecharef: Date) {
    return buildDateFromTo(fecharef);
  }

  txForCurrentWeek(date: Date): string {
    return buildFecharefLabel(date);
  }

  txForEpidemioWeek(date: Date): string {
    return buildEpidemioWeek(date);
  }

  epidemioWeekCount(date: Date): number {
    return getEpidemicWeekOfTheYear(date);
  }

  nextLaborDate(date: Date, offset: number) {
    offset = offset || 0;
    return nextLaborDay(date, offset);
  }

  timeOutOfScope(): boolean {
    return timeOutOfScope();
  }

  isWithinPeriod(fd, fh): boolean {
    if (!fd || !fh) return false;
    let ok = true;

    let lower = this.dateFromTx(fd);
    let upper = this.dateFromTx(fh);
    let check = this.dateFromTx(this.txFromDate(new Date()));
    if (check < lower || check > upper) ok = false

    return ok;
  }

  projectedDate(date: Date, d: number, m: number) {
    return getProjectedDate(date, d, m);
  }

  evaluateEdad = function (fenac: string, tdoc?: string, ndoc?: string): string {
    let edad = '';

    if (this.validAge(fenac)) {
      edad = this.edadActual(this.dateFromTx(fenac)) + '';

    } else {
      fenac = searchBestDoB(tdoc, ndoc);

      if (fenac) {
        edad = this.edadActual(this.dateFromTx(fenac)) + ' aprox';
      }

    }
    return edad;
  }

  edadActual(dob: Date) {
    if (!dob) return null;
    let diff_ms = Date.now() - dob.getTime();
    let age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }

  validAge(value: string): boolean {
    let validAge = false;
    if (value) {
      let today = Date.now();
      let date = this.dateFromTx(value);
      if (date && date.getTime() < today) {
        let edad = this.edadActual(new Date(date.getTime()));
        if (edad >= 0 && edad < 110) validAge = true;
      }
    }

    return validAge;
  }

  txNormalize(datex: string) {
    return this.txFromDate(this.dateFromTx(datex))
  }

  setFecha(fecha: Date): string {
    return fecha.getFullYear() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getDate();
  }

  disabledContextMenu(): boolean {
    // Para deshabilitar el menú conextual, lo que hay que hacer es indicar el
    // DOM ELEMENT que nos intereza deshabilitar y asignarle esta funcion
    // document.oncontextmenu = disabledContextMenu;
    return false;
  }

  getPreviousWeek(fecharef: Date): { feDesde: string, feHasta: string } {
    let fecha_origen: Date = new Date(fecharef.getTime());
    let fech_aux = new Date(fecharef.getTime());
    let ts_desde = fech_aux.setDate(fech_aux.getDate() - 7);
    return { feDesde: dateToStr(new Date(ts_desde)), feHasta: dateToStr(fecha_origen) }
  }

  /**
  * Copia las claves de obj2 a obj1, siempre que las claves existan en ambos objetos.
  * Utilizado como reemplazo de Objet.assign, que copia todo indistintamente.
  *
  *  Devuelve un objeto del mismo tipo que obj1
  *
  * @param obj1 Objeto destino
  * @param obj2 Objeto origen
  */
  copyMatchingKeys<T>(obj1: T, obj2: any): T {
    for (const k of Object.keys(obj1)) {
      if (k in obj2) {
        obj1[k] = obj2[k];
      }
    }

    return obj1;
  }

  /**
   * Normaliza el identificador para una UDA, siguiendo los criterios:
   *
   * - guión medio se convierte a guión bajo
   *
   * @param identifier el identificador a normalizar
   * @returns {string}
   */
  normalizeUdaIdentifier(identifier: string): string {
    return identifier.replace('-', '_');
  }

  tsToDateInputTx(tx: string): number {
    let timestamp = null;
    if (tx.length === 4) {
      /** Solamente ingreso el año */

      timestamp = this.dateNumFromTx(`01/01-${tx}`);
    } else if (tx.length === 6 || tx.length === 7) {
      /** Mes - año */
      timestamp = devutils.dateNumFromTx(`01/${tx}`);
    } else {
      /** Fecha normal */
      timestamp = devutils.dateNumFromTx(tx);
    }
    return timestamp;
  }


  normalizeSpaces(str: string): string {
    return str.replace(/[\s]+/g, '-');
  }

  normalizeString(source: string): string {
    const toReplace = {
      'á': 'a',
      'é': 'e',
      'í': 'i',
      'ó': 'o',
      'ú': 'u',
      'ñ': 'n',
      ' ': '-',
      'ä': 'a',
      'ë': 'e',
      'ï': 'i',
      'ö': 'o',
      'ü': 'u',
      '*': '',
      ':': '',
      ';': '',
      '<': '',
      '>': '',
      '(': '',
      ')': '',
      '[': '',
      ']': '',
      '"': '',
      '.': '',
      ',': ''
    };

    let str = source.toLowerCase();
    str = str.replace(/[áÁéÉíÍóÓúÚñ,\.\(\)\[\]\*:;"]/ig, function (c) {
      return toReplace[c];
    });
    str = str.replace(/<[^>]*>/g, ' ');
    str = this.normalizeSpaces(str);
    return str;

  }

  cleanLeadingAndTrailingUnderscores(word: string): string {
    if(!word)
      return '';

    return word.replace(/_+$/, '').replace(/^_/, '');
  }

  public equalPasswordValidator(form: FormGroup, labelPass: string, labelConfPass: string): ValidatorFn {
    return (): ValidationErrors | null => {
      let pass = form.get(labelPass).value;
      let confPass = form.get(labelConfPass).value;
      return pass === confPass ? null : { same: true }
    }
  }

}

export const devutils = new Devutils();
