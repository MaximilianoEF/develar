
export class VidaQuery {
  recurso: string;
  logica: string;
  condiciones: Array<Condiciones>;
}
export class Condiciones {
    termino?: string;
    buscarEn?: string = 'title';
    tipoBusqueda?: string = 'aprox';
}
