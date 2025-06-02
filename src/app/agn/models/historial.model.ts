import { VidaQuery } from './vidaQuery.model';

export class ConsultaAcervoQuery {
   // query : VidaQuery;
    txFecha : string;
    tsFechaHora : number;
    txHora : string;
    userId : string;
    userNombre : string;
    userEdad : number;
    _id : string;
    hits : number;
    palabras : string[];
}

export class ConsultaAcervo {
  query : VidaQuery;
  txFecha : string;
  tsFechaHora : number;
  txHora : string;
  user : UserMinimal;
  _id : string;
  hits : number;
  palabras : string[];
}

export class UserMinimal {
  userId : string;
  nombre : string;
  edad : number;
}



export class BusquedaTable {
    _id: string;
    descripcion : string[];
    txFechaHora: string;
    tsFechaHora: number;
    recurso : string;
    query : VidaQuery;
  }
  