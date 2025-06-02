
export class AccessionRecord {
  _id: string;
  idAR: string;
  uda: UnidadDescripcionProxy;
  orden_relativo_uda: number;
  type: string; //migraciones - nombre - lugares ...
  audit: AuditAR; // Datos de control interno.
  migrante: Migrante;

  constructor() {
    this.idAR = '';
    this.uda = new UnidadDescripcionProxy();
    this.type = '';
    this.audit = new AuditAR();
    this.migrante = new Migrante();
  }
}

export class Migrante {
  num_expediente: string;
  barco: string;
  puerto: string;
  libro: string;
  caja: string;

  /** Fechas correspondiente al libro */
  date_type: string;
  fe_migracion_tx: string; 
  fe_migracion_ts: number;
  anio_migracion: number;

  observaciones: string;
  novedad: string;

  nombre: string;
  apellido: string;
  fe_nacimiento_tx: string;
  fe_nacimiento_ts: number;
  sexo: string;

  constructor() {
    this.num_expediente = '';
    this.barco = '';
    this.puerto = '';
    this.libro = '';
    this.caja = '';
    this.date_type = '';
    this.fe_migracion_ts = null;
    this.fe_migracion_tx = '';
    this.observaciones = '';
    this.novedad = '';

    this.nombre = '';
    this.apellido = '';
    this.sexo = '';
  }
}

export class AuditAR {
  estado: string;
  fe_alta_tx: string;
  fe_alta_ts: number;
  userId: string;
  username: string;
}

export class AccessionRecordQuery {
  anioDesde?: number;
  anioHasta?: number;
  date_type?: string;
  idUda?: string;
}

export class AccessionRecordTable {
  _id: string;
  idAR: string;
  nomyape: string;
  date_type: string;
  fe_nacimiento_tx: string;
  fe_nacimiento_ts: number;
  barco: string;
  fe_migracion_tx: string;
  fe_migracion_ts: number;
  fe_egreso_tx: string;
  fe_egreso_ts: number;
  observaciones: string;
  idUda: string;
  assetId: string;
  source: AccessionRecord
}

export class UnidadDescripcionProxy {
  atomSlug: string;
  reference_code: string[];
  title: string;
  idUda: string;
  assetId: string;

  constructor() {
    this.atomSlug = '';
    this.reference_code = [];
    this.title = '';
    this.idUda = '';
    this.assetId = '';
  }
}
