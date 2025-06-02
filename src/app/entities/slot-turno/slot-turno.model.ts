import { Audit } from '../ingesta/ingesta.model';

export class SlotTurno {
  _id: string;
  dow: number; // 0-6 0:Domingo, 1:Lunes....
  hora_tx: string; // hora tal cual la escribe el usuario
  hora: number; // 0-23
  minutos: number; // 00 | 15 | 30 | 45 dificilmente se asignen turnos con precisión mayor a 15 minutos
  duracion: number; // en minutos

  capacidad: number; // capacidad en unidades máxima para el SLOT
  slug: string; // Leyenda literal tal como se muestra este horario
  estado: 'activo'; // cabría desactivar un día en particular

  slotId: string; // _id del TurnoTemplate al que pertenece este slot
}

export class SlotTurnoTemplate {
  _id: string;
  nombreturno: string;
  sede: string;
  sala: string;
  estado: string = 'activo'; // si no está activo, se elimina la oferta de turnos
  thorario: number; // para qué es esto esto?? siempre preferimos tipificaciones alfabéticas, son más autoexplicativas.
  type: string; // tipo de turno 'consultasacervo', 'tramites', 'biblioteca', 'administración'
  description: ''; // explicación del turno
  slug: ''; // mostrar-como del turno, es la leyenda que se muestra en el combo de selección de turnos
  novedad: ''; // se indica alguna novedad en caso de que se actualice el estado de la turnera (por ejemplo se inactiva por desinfección)
  fechaalta_tx: string;
  fechaalta_ts: number;

  slots: SlotTurno[];

  audit: Audit;
}

export class SlotTurnoQuery {
  sede?: string;
  estado?: string;
  dow?: number;
  type?: string;
}

export class SlotTurnoTable {
  _id: string;
  nombre: string;
  dow: string;
  estado: string;
  slug: string;
  type: string;
  sede: string;
}
