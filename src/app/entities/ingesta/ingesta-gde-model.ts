
export class GedoTipoDocumento {
    ID: number;                       // lista controlada
    NOMBRE: string;                   // lista controlada
    ACRONIMO: string;                 // lista controlada
    DESCRIPCION: string;              // lista controlada
    ES_ESPECIAL : number;             // pseudo boolean 1=true 0=false
    TIENE_TOKEN : number;             // pseudo boolean 1=true 0=false
    TIENE_TEMPLATE : number;          // pseudo boolean 1=true 0=false
    CODIGOTIPODOCUMENTOSADE: string;  // lista controlada
    ESCONFIDENCIAL: number;           // pseudo boolean 1=true 0=false
    ESFIRMAEXTERNA: number;           // pseudo boolean 1=true 0=false
    ESMANUAL: number;                 // pseudo boolean 1=true 0=false
    ESAUTOMATICA: number;             // pseudo boolean 1=true 0=false
    ESFIRMACONJUNTA: number;          // pseudo boolean 1=true 0=false
    PERMITE_EMBEBIDOS: number;        // pseudo boolean 1=true 0=false
    TIPOPRODUCCION: number;           // lista controlada
    VERSION: number;
    ES_COMUNICABLE: number;           // pseudo boolean 1=true 0=false
    FECHA_CREACION: string;           // date_string      
    ES_TRANSFERIBLE: number;          // pseudo boolean 1=true 0=false
    ES_ACTO_ADMINISTRATIVO: number;   // pseudo boolean 1=true 0=false
    ES_CODIGO_QR: number;             // pseudo boolean 1=true 0=false
}

export class GedoDocumento {
    ID: number;                    // lista controlada
    NUMERO: string;                // lista controlada
    NUMEROESPECIAL: string;        // lista controlada
    REPARTICION: string;           // lista controlada
    ANIO: number;                  // aaaa
    MOTIVO: string;                // lista controlada
    USUARIOGENERADOR: string;      // 
    FECHACREACION: string;         // date_string
    TIPO: number;                  // lista controlada
    SISTEMAORIGEN: string;         // lista controlada
    USUARIOINICIADOR: string;      // 
    TIPORESERVA: number;           // lista controlada
    APODERADO: string;             // 
    REPARTICION_ACTUAL: string;    // lista controlada
    PESO: number;                  // peso del documento en bytes
    ESTA_PUBLICADO: number;        // pseudo boolean 1=true 0=false
    JURISDICCION: string;          // lista controlada
    CODIGOECOSISTEMA: string;      // lista controlada
    DATOS_USUARIO: string;         // 

}

export class GedoHistorial {
    USUARIO: string;             //
    ACTIVIDAD: string;           // lista controlada
    CODIGOECOSISTEMA: string;    // null?
    DATOS_USUARIO: string;       //
}

export class TransferStatusToken {
    sessionId: string;
    loteId: string;
    documentoId: string;

    agnUserId: string;

    fecha_tx: string;
    fecha_ts: number; 

    estado_tx: string;
    observacion: string;

}

export class FolderLocation {
    server: string;       // server protocol path
    serverPath: string;   // url_encoded
    rootPath: string;     // ruta a la carpeta del LOTE
    folderId: string;     // identificador del folder

}

export class AssetPath {
    fileType: string;   // file | folder
    mimeType: string;   // pdf
    basename: string;   // nom de arch c/extensión: ar-gde-dcto-202020.pdf
    name: string;       // nom de arch s/extensión: ar-gde-dcto-202020
    assetPath: string;  //  $serverPath/$rootPath/assetPath
    path: string;        // assetPath/basename
    peso: number;
    role: string;
    hash256: string;

}

// DOCUMENTO
export class DocumentTransfer {
    tipoDocumento: GedoTipoDocumento;
    documento: GedoDocumento;
    historial: GedoHistorial[];

    // objeto digital que representa el documento
    main_object: AssetPath;

    // objetos complementarios
    related_objects: AssetPath[];

    // estado del documento
    transferstatus: TransferStatusToken;
}

// LOTE
export class LoteTransfer{
    loteId: string;
    fecha_creacion: string;
    estado: String;
    cant_documentos: number; 

    transferstatus: TransferStatusToken;

    // los documentos incluidos en el LOTE
    documentos: Array<DocumentTransfer>

    // ubicación de la carpeta que contiene los objetos del LOTE
    folder_location: FolderLocation;

}
// LOTES TRANSFERIDOS
// Array<LoteTransfer>

// SESSION TOKEN
export class SessionToken{
    fecha_ts: number;
    sessionId: number;
    status: string;
    fe_exp_ts: number // vigencia de la session 
}

// ERROR TOKEN
export class ErrorToken{
    fecha_ts: number;
    error_code: string;
    error_data: string;
}

// Resultado de la conexión
export class TxStatusToken{
    fecha_ts: number;
    status: string;
}

export class LoteStatus {
    loteId: string;

    // el estado que AGN reporta a GDE respecto de la transferencia del LOTE
    loteStatus: TransferStatusToken;

    // lista de documentos pertenecientes al lote
    // que presentaron algún problema o evento
    reportedDocuments: TransferStatusToken[];

}
// LOTES_UPDATE_STATUS
// Array<LoteStatus>


export class MetadatoToken {
    // taxonomia, tesauro, lista controlada
    taxonomia: string // nombre de la lista controlada o tesauro 
    estado: string;
    scope: string; 

    // IDENTIFICADOR
    tipo: string;
    valueTx: string
    valueNum: number;

    // descripcion
    descrip_corta: string;
    descrip_larga: string;

}

