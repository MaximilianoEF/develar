export class Uco {
    _id : string;
    cod_uco : string;
    slug : string;
    descripcion : string;
    cod_barras : string;
    ucoData : UcoData;
    ucoEstado: UcoEstado;


}
export class UcoEstado {
    estadoConservacion: string = "no_aplica"; //estadoUcoOptList 1: no_aplica ; 2: pendiente; 3: en proceso; 4: cumplido; 5: suspendido
    estadoPreparacion: string = "no_aplica";
    estadoDigitalizacion: string = "no_aplica";
    estadoIngesta: string = "no_aplica";

    current_action: string; //action
    c_ubi: string; //ubicacionOptList
    fe_novedad_tx: string;
    fe_novedad_ts: string;
    observacion: string; 
}

export class UcoData {
    // Si la caja contiene una identificación, deberiamos tener guardado la referencia del mismo
    /** A continuación, se presentara el breadcumb para hallar la caja en cuestión (Referencia tentativa) */
    sede : string;
    sala : string;
    pasillo : string;
    estanteria : string;
    estante : string;
    /***/
    //La UCO puede tener como nivel de descripción UDC, ya que si se cargan UDS directamente en la misma, cumpliria el rol de UDC y tendría
    //cargado es isUco en TRUE, y el IngestProccess con los campos respectivos.
}

export class UcoTableData {
    _id : string;
    cod_uco : string;
    slug : string;
}

export class UcoQuery {
    cod_uco;
    slug;
}