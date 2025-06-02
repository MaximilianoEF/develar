export class TechMachine {
    _id : string;
    cod_machine : string;
    slug : string;
    descripcion : string;
    software : string;
    version_software : string;
    marca : string;
    modelo : string;
    fe_incorporacion_tx : string;
    fe_incorporacion_ts : number;
    type_digitalizacion : string;
    usos : string;
}
export class TechMachineQuery {
    cod_machine : string;
    slug : string;
    marca : string;
}

export class TechMachineTable {
    cod_machine : string;
    slug : string;
    marca_modelo : string;
    fe_incorporacion_tx : string;
    fe_incorporacion_ts : number;
    _id : string;
}