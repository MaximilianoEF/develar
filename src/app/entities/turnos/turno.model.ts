import { Pase } from '../consultas/consulta.model';

export class RequirenteTurno {
  personId: string;
  userId: string;
  ndoc: string;
  displayName: string;
}

/*
Ejemplos de avance para sol. de asistencia:

'emitido', 'descartado', 'esperamedico', 'enobservacion', 'nocontesta', 'enaislamiento', 'esperasame'

*/


export class Turno {
  _id: string;
  turnoId?: string;
  requirente?: RequirenteTurno;
  estado?: string;
  avance?: string;
  sede?: string;
  sala?: string;
  slotId? : string;
  txFecha?: string;
  txHora?: string;
  duracion?: number;
  tsFechaHora?: number;
  detalle?: string;
  tipoConsulta?: 'audio' | 'video' | 'documental' | 'fotografia' | null;
  source?: 'admin' | 'user' | null;
  pases : Pase[] = [];
}


export class TurnoTable {
  _id: string;
  estado: string;
  sede: string;
  sala: string;
  ndoc: string;
  displayName: string;
  txFechaHora: string;
  tsFechaHora: string;
  detalle: string;
  tipoConsulta: string;
  avance: string;
}


export class TurnoQuery {
  sede: string;
  tipoConsulta: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
}

export class TurnoDisponible {
  _id?: string;
  capacidad?: number;
  hora?: string;
  horaNum : number;
  minutos : number;
  franja: string;
  duracion: number;
  slug: string;
}

export class AvailableSlotResultData {
  items?: TurnoDisponible[]
}
export class AvailableSlotResult {
  status?: string;
  data?: AvailableSlotResultData
}

// export class TurnoDisponible {
//   _id: string;
//   estado?: 'activo' | 'cancelado' | null = 'activo';
//   duracion?: number;
//   thorario?: number;
//   dow?: number;
//   hora?: number;
//   sede?: string;
//   capacidad?: number;
//   slug?: string;
// }

