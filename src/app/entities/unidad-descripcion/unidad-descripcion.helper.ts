import { devutils } from '../../develar-commons/utils';
import {
  UnidadDescripcion,
  UnidadDescripcionTable,
  UnidadDescripcionQuery,
  UnidadDescripcionHistoryEntry,
  UnidadDescripcionHistoryList,
  JerarquiaUD,
  MinimalChildren,
  IdentificadorUD,
  ChildrenUD,
  IngestadosAndNoIngestados,
  ApareoUda,
  ActionUda
} from './unidad-descripcion.model';
import { UnidadDescripcionService } from './unidad-descripcion.service';
import { AuthorityRecord } from '../authority-record/authority-record.model';
import { ParentUD } from './unidad-descripcion.model';
import { BehaviorSubject } from 'rxjs';
import { User } from '../user/user';

const tiposExportacionesList = [
  { val: 'ATOM-ALTA', label: 'Transferencia de nuevos UDA de GDOC a AtoM', slug: 'Transferencia de nuevos UDA de GDOC a AtoM'},
  { val: 'NODOS-ISAD-G', label: 'Nodos ISAD-G', slug: 'Nodos ISAD-G'}
];

const tipoPuntoAccesoList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido'},
  { val: 'barco', label: 'Barco', slug: 'barco' },
  { val: 'sobre', label: 'Sobre', slug: 'sobre' }
];

const descriptionLevelList = [
  { val: 'no_definido', order: 90, label: 'Sinselección', slug: 'no_definido', children: [] },
  { val: 'fondo', order: 1, label: 'Fondo', slug: 'Fondo', children: ['subfondo', 'seccion', 'serie', 'serie facticia', 'subserie', 'unidad documental'] },
  { val: 'seccion', order: 2, label: 'Sección', slug: 'Sección', children: ['seccion', 'serie',  'serie facticia','subserie', 'unidad documental'] },
  { val: 'subfondo', order: 3, label: 'Sub-fondo', slug: 'SubF', children: ['subfondo', 'seccion', 'serie', 'serie facticia', 'subserie', 'unidad documental'] },
  { val: 'serie', order: 4, label: 'Serie', slug: 'Serie', children: ['serie', 'serie facticia', 'subserie', 'unidad documental'] },
  { val: 'serie facticia', order: 4, label: 'Serie facticia', slug: 'SerieFac', children: ['serie facticia', 'subserie', 'unidad documental'] },
  { val: 'subserie', order: 5, label: 'Sub-serie', slug: 'SubS', children: ['subserie', 'unidad documental'] },
  { val: 'unidad documental', order: 5, label: 'UDC', slug: 'UDC', children: ['item', 'unidad documental'] },
  { val: 'item', order: 5, label: 'UDS', slug: 'UDS', children: ['part'] },
  { val: 'part', order: 5, label: 'Parte', slug: 'Part' },                                  // Rol de anverso-reverso
  { val: 'coleccion', order: 5, label: 'Colección', slug: 'Colección', children: [] }
];

const estadosList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido' },
  { val: 'activo', label: 'Activa', slug: 'activo' },
  { val: 'baja', label: 'Baja', slug: 'baja' },
];

const estadosControlDescripcionList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido' },
  { val: 'Revisado', label: 'Revisado', slug: 'activo' },
  { val: 'Final', label: 'Final'},
  { val: 'Borrador', label: 'Borrador'},
];

const levelDetailList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido' },
  { val: 'Completo', label: 'Completo' },
  { val: 'Parcial', label: 'Parcial'},
  { val: 'Básico', label: 'Básico'},
]

const nivelAvanceList = [
  { val: 'no_definido', label: 'Sin selección', slug: 'no_definido' },
  { val: 'emitido', label: 'Emitida', slug: 'emitido' },
  { val: 'descpendiente', label: 'Descripción normalizada pendiente', slug: 'descpendiente' },
  { val: 'descproceso', label: 'Descripción normalizada en proceso', slug: 'descproceso' },
  { val: 'descpendienteaprobar', label: 'Descripción normalizada pendiente de aprobar', slug: 'descpendienteaprobar' },
  { val: 'descaprobada', label: 'Descripción normalizada aprobada', slug: 'descaprobada' }
];

const identifierDateTypeList = [
  { val: 'accumulation',  label: 'Acumulación', slug: 'accumulation' },
  { val: 'creacion',      label: 'Creación', slug: 'creacion' },
  { val: 'produccion',    label: 'Producción', slug: 'produccion' },
  { val: 'maxactivity',   label: 'Máxima actividad', slug: 'maxactivity' },
  { val: 'annexation',    label: 'Fecha de anexión', slug: 'annexation' },
  { val: 'specific',      label: 'Evento puntual', slug: 'specific' },
  { val: 'predominantes', label: 'Predominantes', slug: 'predominantes' },
  { val: 'arribovapor',   label: 'Arribo vapor'},
  { val: 'isEgreso',      label: 'Egreso' },
  { val: 'migraciones',   label: 'Migraciones', slug: 'migraciones' }
];

const keyDateList = [
  { val: 'type', label: 'Tipo de fecha' },
  { val: 'date', label: 'Fecha texto' },
  { val: 'start_date', label: 'Fecha inicio/creación', },
  { val: 'end_date', label: 'Fecha hasta/finalización' },
  { val: 'observacion', label: 'Observación correspondiente a la fecha' }
]

const propertiesList = [
  { val: 'identifier', label: 'Identificador' },
  { val: 'level_of_description', label: 'Nivel de descripción' },
  { val: 'title', label: 'Titulo' },
  { val: 'dates', label: 'Fechas' },
  { val: 'extendAndMedium', label: 'Volumen y soporte' },
];

const actionsContentAndStructureList = [
  { val: 'no_definido', label: 'No definido' },
  { val: 'evaluacion', label: 'Evaluación' },
  { val: 'destruccion', label: 'Destrucción' },
  { val: 'programacion', label: 'Programación' }
];

const arreglosList = [
  { val: 'no_definido', label: 'No definido' },
  { val: 'estructura_interna', label: 'Estructura interna' },
  { val: 'orden', label: 'Orden' },
  { val: 'sist_clasif', label: 'Sistema de clasificación' }
];

const idiomasList = [
  { val: 'en', label: 'English', atom: 'ingles' },
  { val: 'fr', label: 'Français', atom: 'frances' },
  { val: 'es', label: 'Español', atom: 'espanol' },
  { val: 'nd', label: 'Nederlands', atom: 'nederlands' },
  { val: 'pg', label: 'Português', atom: 'portugues' },
  { val: 'la', label: 'Latín', atom: 'latin' }
];

const actionsOfUDAList = [
  { val: 'no_definido', label: 'No definido' },
  { val: 'apareo', label: 'Apareo' },
]

const defaultOptionList = [
  { val: 'no_definido', type: 'no_definido', label: 'no_definido' },
];


const optionsLists = {
  default: defaultOptionList,
  descriptionLevel: descriptionLevelList,
  estados: estadosList,
  estados_control_descripcion: estadosControlDescripcionList,
  nivelAvance: nivelAvanceList,
  identifierDateType: identifierDateTypeList,
  keyDate: keyDateList,
  properties: propertiesList,
  actionsContentAndStructure: actionsContentAndStructureList,
  arreglos: arreglosList,
  idiomas: idiomasList,
  actionsOfUDA: actionsOfUDAList,
  level_detail: levelDetailList,
  tipoPuntoAcceso: tipoPuntoAccesoList,
  tiposExportaciones: tiposExportacionesList
};

// Define para qué niveles de descripción se mostrará el
// enlace hacia los puntos de acceso
const CAN_NAVIGATE_TO_ACCESSIONRECORDS = ['unidad documental', 'item'];

function getLabel(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.label : val;
}

function getSlug(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.slug : val;
}

function getChildren(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.children : [];
}

export class UnidadDescripcionHelper {

  static cleanQueryToken(query: UnidadDescripcionQuery): UnidadDescripcionQuery {
    if (!query) {
      return null;
    }

    Object.keys(query).forEach((key) => {
      if (
        query[key] == null ||
        query[key] === '' ||
        query[key] === 'no_definido'
      ) {
        delete query[key];
      }
    });

    return query;
  }

  static atomSlug(ud: UnidadDescripcion): string {
    let atomSlug = ''

    if (ud.isAtom) {
      atomSlug = ud.atomSlug ? 'ATOM: ' + ud.atomSlug : 'ATOM: identificador no hallado'
    }

    return atomSlug;
  }


  static getOptionList(type) {
    return optionsLists[type] || optionsLists['default'];
  }

  static getOptionLabel(type, val) {
    if (!val) {
      return 'no_definido';
    }
    if (!type) {
      return val;
    }
    return getLabel(this.getOptionList(type), val);
  }

  static getOptionSlug(type, val) {
    if (!val) {
      return 'no_definido';
    }
    if (!type) {
      return val;
    }
    return getSlug(this.getOptionList(type), val);
  }

  static getOptionChildren(type: string, val: string): string[] {
    if (!val || !type)
      return [];

    return getChildren(this.getOptionList(type), val);
  }

  static buildUnidadDescripcionDataTable(itemList: UnidadDescripcion[]): UnidadDescripcionTable[] {
    return itemList.map((token) => {
      const tableCell = new UnidadDescripcionTable();

      tableCell._id = token._id;

      tableCell.isUDCorUDS = CAN_NAVIGATE_TO_ACCESSIONRECORDS.includes(token.identificador.level_of_description);

      tableCell.descriptionlevel = UnidadDescripcionHelper.getOptionLabel(
        'descriptionLevel',
        token.identificador.level_of_description
      );
      tableCell.identifier = token.identificador.identifier;
      tableCell.title = token.identificador?.title || '';
      tableCell.date = token.identificador && token.identificador.dates && token.identificador.dates.length ?
        token.identificador.dates[0].date : '';
      tableCell.atomSlug = token.atomSlug;

      tableCell.isTransferidaAtom = token.audit.transferidoAtom;


      if (token.assets && token.assets.length)
        tableCell.assetIds = token.assets.map((asset) => asset.entityId);


      if (token.identificador && token.identificador.reference_code && token.identificador.reference_code.length) {
        tableCell.reference_code = this.buildReferenceCode(token.identificador.reference_code);
      }
      return tableCell;
    });
  }

  static buildReferenceCode(reference_code: string[]): string {
    if (reference_code && reference_code.length) {
      return reference_code.reduce((acum, current, index) => {
        acum += index < (reference_code.length - 1) ? `${current}-` : `${current}`;
        return acum;
      }, '')
    }
    return '';
  }

  static verifyLevelOfDescriptionFatherAndSon(levelOfHijo: string, levelOfPadre: string): boolean {
    //Traigo la Lista de los description level y busco la que corresponda a la del padre y me quedo con sus hijos
    const levels_of_description_allowed = this.getOptionChildren('descriptionLevel', levelOfPadre);
    if (levels_of_description_allowed && levels_of_description_allowed.length) {
      /** Verifico que efectivamente sea un nivel de descripción permitido
       *  el del hijo con respecto al del padre.
       */
      const hijos = levels_of_description_allowed.filter((hijo) => hijo === levelOfHijo);
      return !!(hijos && hijos.length);
    }
    return false;
  }

  static buildHistoryList(
    itemList: UnidadDescripcionHistoryEntry[]
  ): UnidadDescripcionHistoryList[] {
    return itemList.map((token, index) => {
      const item = new UnidadDescripcionHistoryList();

      item.version = index;
      item.motivo = token.reason;
      item.detalle = token.comment;
      item.fechaCreacion = devutils.txFromDate(new Date(token.changedAt));

      return item;
    });
  }

  static buildJerarquiaView(list: Array<JerarquiaUD[]>): Array<JerarquiaUD[]> {

    list.forEach(l => {
      l.forEach((token) => {

        token.isArray = !!Array.isArray(token.value);
        if (token.isArray) {
          let value = "";
          if (token.propiedad === 'dates') {
            token.value = UnidadDescripcionHelper.buildDatesProperties(value, token);
          } else {
            token.value = value;
          }
          //La idea es que si detectamos que van haber mas atributos array, generar un switch que contenga a cada propiedad
        }
        token.propiedad = UnidadDescripcionHelper.getOptionLabel('properties', token.propiedad);
        token.level_of_description = UnidadDescripcionHelper.getOptionLabel('descriptionLevel', token.level_of_description);

      });
    })

    return list;

  }

  static buildDatesProperties(value: string, token: JerarquiaUD): string {
    for (let i = 0; i < token.value.length; i++) {
      Object.keys(token.value[i]).forEach(key => {
        if (key != '_id' && key != 'end_date_ts' && key != 'start_date_ts') {
          value += '<strong>' + UnidadDescripcionHelper.getOptionLabel('keyDate', key) + '</strong> : ';

          value += key === 'type' ? UnidadDescripcionHelper.getOptionLabel('identifierDateType', token.value[i][key]) : token.value[i][key];
          value += '<br/>';
        }
      })
      value += '<hr/>'
    }
    if (value.length === 0) {
      value += 'No contiene fechas cargadas <br/>';
    }
    return value;
  }

  static buildParentFromUd(ud: UnidadDescripcion): ParentUD {
    const parent = new ParentUD();
    parent.id_parent = ud._id;
    parent.identifier = ud.identificador.identifier;
    parent.level_of_description = ud.identificador.level_of_description;
    parent.title = ud.identificador.title;
    parent.reference_code = ud.identificador.reference_code;
    return parent;
  }

  // static buildChildrenFromUd(ud: UnidadDescripcion): ChildrenUD {
  //   const children = new ChildrenUD();
  //   children.id_children = ud._id;
  //   children.identifier = ud.identificador.identifier;
  //   children.level_of_description = ud.identificador.level_of_description;
  //   children.title = ud.identificador.title;
  //   children.reference_code = ud.identificador.reference_code;
  //   return children;
  // }

  static referenceCodeToString(identificador: IdentificadorUD): string {
    if (identificador && identificador.reference_code && identificador.reference_code.length) {
      return identificador.reference_code.join('-');
    } else {
      return 'AR-AGN-Código-no-definido'
    }

  }
  static buildIdentifierCode(company?: AuthorityRecord, identifier?: string, parentTree?: string[]): string {
    let codeBuilt = '';

    if (company) {
      // Código de país
      // codeBuilt += company.countryPrefix;
      codeBuilt += company.identityArea.countryPrefix;

      // Separador
      codeBuilt += '-';

      // Código de organización
      // codeBuilt += company.companyPrefix;
      codeBuilt += company.controlArea.identifier;
    }

    // Procesar el árbol de identificadores del parent
    // y sus antecesores
    if (parentTree && parentTree.length > 0) {
      codeBuilt += '-';
      codeBuilt += parentTree.join('-');
    }

    // Identificador propio de la unidad documental
    if (identifier) {
      codeBuilt += '-';

      // Identificador de la propia U.D.
      codeBuilt += identifier;
    }

    return codeBuilt;
  }

  static async buildParentTree(ud: UnidadDescripcion, service: UnidadDescripcionService): Promise<string[]> {
    const parentArray: string[] = [];
    let parentNode = null;

    if (ud.parent) {
      parentNode = await service.findById(ud.parent.id_parent);
      parentArray.push(parentNode.identificador.identifier);

      while (parentNode.parent) {
        parentNode = await service.findById(parentNode.parent.id_parent);
        parentArray.push(parentNode.identificador.identifier);
      }

      parentArray.reverse();
    }
    return new Promise(resolve => resolve(parentArray));
  }

  static buildUdaChildrenCounters(childrenList: ChildrenUD[]): Array<MinimalChildren> {
    let arrAux = new Array<MinimalChildren>();
    if (childrenList && childrenList.length > 0) {
      arrAux = childrenList.reduce((acc, current) => {
        let label = UnidadDescripcionHelper.getOptionSlug('descriptionLevel', current.level_of_description);
        let content = acc.find(f => f.type == label);

        if (content) {
          content.length++;
        } else {
          let element = new MinimalChildren();
          element.type = label;
          element.length = 0;
          element.length++;
          acc.push(element);
        }

        return acc;
      }, new Array<MinimalChildren>())

      return arrAux;
    }
    return null;
  }

  static buildProcedureTxt(list: string[]): string {
    let procedure: string = "";

    list.forEach(l => {
      procedure = procedure + l + '\n\n';
    })

    return procedure;
  }


  /** Separa los hijos uda ingestados de los no ingestados */
  static forkIngestedFromNoIngested(udaList: ApareoUda[]): IngestadosAndNoIngestados {
    const acumApareo = new IngestadosAndNoIngestados();
    const ingestados = new Array<ApareoUda>();
    const noIngestados = new Array<ApareoUda>();

    udaList.forEach(item => {
      if (item && item.isIngestado) {
        ingestados.push(item);
      } else {
        noIngestados.push(item);
      }
    })

    acumApareo.ingestados = new BehaviorSubject<ApareoUda[]>(ingestados);
    acumApareo.noIngestados = new BehaviorSubject<ApareoUda[]>(noIngestados);
    return acumApareo;
  }

  static filterUdasWithActionId(type: string, actionId: string, udaList: ApareoUda[]): ApareoUda[] {

    const udaListFiltered = new Array<ApareoUda>();

    udaList.forEach(uda => {
      if (uda.actions && uda.actions.length) {

        const equalAction = uda.actions.filter(action => action.type === type && action.actionId === actionId);
        if(!equalAction || !equalAction.length){
          udaListFiltered.push(uda);
        }
      }else{
        /** Quiere decir que todavía no tiene ninguna acción cargada*/
          udaListFiltered.push(uda);
        }
    });

    return udaListFiltered;
  }

  static filterUdasApareadasFromSubject(ingestadosAndNoIngestadosList: IngestadosAndNoIngestados, udaApareadas: ApareoUda[]): void {
    if (ingestadosAndNoIngestadosList && udaApareadas && udaApareadas.length) {
      const ingestados = udaApareadas.filter(f => f.isIngestado);
      const noIngestados = udaApareadas.filter(f => !f.isIngestado);

      if (ingestados && ingestados.length && ingestadosAndNoIngestadosList.ingestados.value) {
        ingestados.forEach(item => {
          const currentIngestados = ingestadosAndNoIngestadosList.ingestados.value.filter(f => f.idUda !== item.idUda);
          ingestadosAndNoIngestadosList.ingestados.next(currentIngestados);
        })
      }
      if (noIngestados && noIngestados.length && ingestadosAndNoIngestadosList.noIngestados.value) {
        noIngestados.forEach(item => {
          const currentNoIngestados = ingestadosAndNoIngestadosList.noIngestados.value.filter(f => f.idUda !== item.idUda);
          ingestadosAndNoIngestadosList.noIngestados.next(currentNoIngestados);
        })
      }
    }
  }

  static factoryActionUda(type: string, actionId: string, user: User, role?: string): ActionUda {
    const actionUda = new ActionUda();
    actionUda.type = type;
    actionUda.actionId = actionId;
    const dateNow = Date.now();
    actionUda.fe_ts = dateNow;
    actionUda.fe_tx = devutils.txFromDateTime(dateNow);
    actionUda.userId = user._id;
    actionUda.userName = user.displayName;

    actionUda.role = role ? role : '';

    return actionUda;
  }
}

