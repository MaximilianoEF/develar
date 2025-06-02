export class TaxonomiaAudit {
    fechaAltaTx: string;
    fechaAltaTs: number;
    userId: string;
    userName: string;

    constructor() {
      this.fechaAltaTx = '';
      this.fechaAltaTs = null;
      this.userId = '';
      this.userName = '';
    }
}

export class Taxonomia {
  _id: string;
  identificador: string;
  descripcion: string;
  slug: string;

  isLocked: boolean;

  audit: TaxonomiaAudit;

  canCreateOnTheFly: boolean;

  constructor(data?: any) {
    this._id = data._id ?? null;
    this.identificador = data.identificador ?? '';
    this.descripcion = data.descripcion ?? '';
    this.slug = data.slug ?? '';

    this.isLocked = data.isLocked ?? false;

    this.audit = new TaxonomiaAudit();

    this.canCreateOnTheFly = data.canCreateOnTheFly ?? false;
  }
}

export class TaxonomiaTermino {
  _id: string;
  identificador: string;
  descripcion: string;
  slug: string;
  sinonimos: string[];
  taxonomiaIdentificador: string;
  taxonomiaId: string;
  isLocked: boolean;
  notasAlcance: string;
  notasOrigen: string;
  formaAbreviada: string;

  parentTermId: string;
  parentTermIdentificador: string;

  constructor(data?: any) {
    this.identificador = data.identificador ?? '';
    this.descripcion = data.descripcion ?? '';
    this.sinonimos = data.sinonimos ?? [];
    this.taxonomiaIdentificador = data.cabeceraIdentificador ?? '';
    this.taxonomiaId = data.cabeceraId ?? '';
    this.isLocked = data.isLocked ?? false;
    this.slug = data.slug ?? '';
    this.notasAlcance = data.notasAlcance ?? '';
    this.notasOrigen = data.notasOrigen ?? '';
    this.formaAbreviada = data.formaAbreviada ?? '';

    this.parentTermId = data.parentTermId ?? '';
    this.parentTermIdentificador = data.parentTermIdentificador ?? '';
  }
}

export class TaxonomiaQuery {
  identificador?: string;
  exact?: boolean;
}

export class TaxonomiaTerminoQuery {
  taxonomiaId?: string;
  identificador?: string;
  exact?: boolean;
}

export class TaxonomiaTable {
  identificador: string;
  source: Taxonomia;
  descripcion?: string;
}

export class TaxonomiaTerminoTable {
  _id: string;
  identificador: string;
  slug: string;
  source: TaxonomiaTermino;
  descripcion?: string;
  taxonomiaId? : string;
  isLocked?: boolean;
}

export interface BreadcrumbPart {
  id: string;
  slug: string;
}
