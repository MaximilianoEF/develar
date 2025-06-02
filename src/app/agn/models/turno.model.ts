export class RequirenteTurno {
  personId: string;
  userId: string;
  displayName: string;
  ndoc: string;
}

export class Turno {
  _id: string;
  requirente?: RequirenteTurno;
  estado?: 'activo' | 'cancelado' | null = 'activo';
  sede?: string;
  txFecha?: string;
  txHora?: string;
  avance?: string = 'pendiente';
  tsFechaHora?: Number;
  detalle?: string;
  tipoConsulta?: 'audio' | 'video' | 'documental' | null;
  source: 'admin' | 'user' | null;
  turnoId: string; // ID del slot donde se asigna este turno
}

export class TurnoDisponible {
  _id: string;
  estado?: 'activo' | 'cancelado' | null = 'activo';
  duracion?: number;
  thorario?: number;
  dow?: number;
  hora?: number;
  sede?: string;
  capacidad?: number;
  slug?: string;
}

export class TurnoTable {
  _id: string;
  estado: string;
  sede: string;
  sala: string;
  txFechaHora: string;
  tsFechaHora: string;
  detalle: string;
  tipoConsulta: string;
  avance : string;
}
