export class Consulta {
  personId: string;
  estado: 'vigente' | 'cancelado' | null;
  sede: string;
  txFecha: string;
  txHora: string;
  tsFechaHora: string;
  detalle: string;
  tipoMaterial: string;
}
