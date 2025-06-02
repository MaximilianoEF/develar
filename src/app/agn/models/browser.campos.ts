export class CondicionBusqueda {
  key: string;
  label: string;
  displayIn?: string[]
}

export const buscarEnOptList: CondicionBusqueda[] = [
  { key: 'all',                      label: 'Todos los campos',                        displayIn: ['1','2','3'] },
  { key: 'alltext',                  label: 'Todos los campos (xPalabra)',             displayIn: ['1','2','3'] },
  { key: 'anio_filmacion_grabacion', label: 'Año de filmación / grabación',            displayIn: ['1','2'] } ,
  { key: 'anio_creacion',            label: 'Año de creación',                         displayIn: ['3'] },
  { key: 'anio_digitalizacion',      label: 'Año de digitalización',                   displayIn: ['1','2'] },
  { key: 'anio_produccion',          label: 'Año de producción',                       displayIn: ['3'] },
  { key: 'collection',               label: 'Fondo/Colección',                         displayIn: ['1','2','3'] },
  { key: 'genre',                    label: 'Género',                                  displayIn: ['1','2']  },
  { key: 'id_externo',               label: 'ID de inventario',                        displayIn: ['1','2']  },
  { key: 'institucion',              label: 'Institución como tema',                   displayIn: ['1','2']  },
  { key: 'legajo',                   label: 'Nº de Legajo',                            displayIn: ['1','2']  },
  { key: 'reference_code',           label: 'Código de referencia',                    displayIn: ['3']      },
  { key: 'transcripcion',            label: 'Palabra en la transcripción del audio',   displayIn: ['1','2'] },
  { key: 'persona',                  label: 'Persona como tema',                       displayIn: ['1','2']  },
  { key: 'productor',                label: 'Productor',                               displayIn: ['1','2']  },
  { key: 'puesta',                   label: 'Responsable de la puesta',                displayIn: ['1','2'] },
  { key: 'tesaurolug',               label: 'Tesauro-lugares',                         displayIn: ['3'] },
  { key: 'tesauronom',               label: 'Tesauro-nombres',                         displayIn: ['3'] },
  { key: 'tesauromat',               label: 'Tesauro-materia',                         displayIn: ['3'] },
  { key: 'tesauroaut',               label: 'Tesauro-autoridad',                       displayIn: ['3'] },
  { key: 'titulo_serie',             label: 'Serie',                                   displayIn: ['1','2','3'] },
  { key: 'cronologico',              label: 'Término cronológico',                     displayIn: ['1','2'] },
  { key: 'geografico',               label: 'Término geográfico',                      displayIn: ['1','2'] },
  { key: 'motivos_tematicos',        label: 'Términos temáticos',                      displayIn: ['1','2'] },
  { key: 'title',                    label: 'Título',                                  displayIn: ['1','2','3'] },
  // {
  //   key: 'titletext',
  //   label: 'Título (xPalabra)',
  // }
];

/**
Se sacaron las palabras claves, a pedido de AGN
  {
    key: "temas_raw",
    label: "Palabras clave",
  },
**/

export const tipoBusquedaOptList: CondicionBusqueda[] = [
  {
    key: 'aprox',
    label: 'Aproximado',
  },
  {
    key: 'exact',
    label: 'Termino Exacto',
  },
];
export const recursosOptList: CondicionBusqueda[] = [
  // {
  //   key: '-1',
  //   label: 'Todos',
  // },
  {
    key: '3',
    label: 'Escritos y fotos'
  },
  {
    key: '1',
    label: 'Video',
  },
  {
    key: '2',
    label: 'Audio',
  }
];

export const logicaOptList: CondicionBusqueda[] = [
  {
    key: 'and',
    label: 'Y',
  },
  {
    key: 'or',
    label: 'O',
  },
  {
    key: 'not',
    label: 'NO',
  },
];
