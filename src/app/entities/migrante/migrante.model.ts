export class Migrante {
  _id: string;
  embarque: string;
  barconombre: string;
  barcocodigo: string;
  nombre: string;
  apellido: string;
  edadanios: string;
  edadmeses: string;
  sexo: string;
  nacionalidad: string;
  profesion: string;
  fechaevento: string;
  fechaevento_ts: number;
  aniomes: number;
  anioevento: number;
  tipoevento: string;
  lugarnacimiento: string;
  nrolista: string;
  nroorden: string;
  paisNacimiento: string;
  fe_importacion: string;
  mesevento: number;

  constructor() {
    this.embarque = '';
    this.barconombre = '';
    this.barcocodigo = '';
    this.nombre = '';
    this.apellido = '';
    this.edadanios = '';
    this.edadmeses = '';
    this.sexo = '';
    this.nacionalidad = '';
    this.profesion = '';
    this.fechaevento = '';
    this.fechaevento_ts = null;
    this.lugarnacimiento = '';
    this.aniomes = null;
    this.anioevento = null;
    this.tipoevento = '';
    this.nrolista = '';
    this.nroorden = '';
    this.paisNacimiento = '';
    this.fe_importacion = '';
    this.mesevento = null;
  }
}

export class MigranteQuery {
  nombre?: string;
  apellido?: string;
  anioDesde?: number;
  anioHasta?: number;
  barconombre?: string;
}

export class MigranteTable {
  nomyape: string;

  nombre: string;
  apellido: string;

  embarque: string;
  barco: string;
  fechaevento: string;
  fechaevento_ts: number;
  source: Migrante;
  nacionalidad: string;
  edad: string;
  observaciones: string;
  detailRow: boolean;
}

export class MigranteAntecedenteData {
  _id: string;
  title: string;
  inventario: string;
  feDesdeHasta: string;
  feDesdeTs: number;
  feHastaTs: number;
  identifier: string;
  assetId: string;
  isUD: boolean;
}
