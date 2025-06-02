import { AuthorityRecord, AuthorityRecordTable, AuthorityRecordQuery, AuthorityRecordControl, AuthorityRecordRelationship, AuthorityRecordRelatedAuthorityRecord, AuthorityRecordRelatedArchivalDescription, AuthorityRecordDescription, AuthorityRecordIdentity } from './authority-record.model';

// ISAAR 5.1.1
const entityTypeOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 'entidadcolectiva', label: 'Entidad colectiva', slug: 'Entidad colectiva' },
  { val: 'familia', label: 'Familia', slug: 'Familia' },
  { val: 'persona', label: 'Persona', slug: 'Persona' }
];

// ISAAR 5.3.2
const relationshipCategoryOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 'jerarquica', label: 'Jerárquica', slug: 'Jerárquica' },
  { val: 'temporal', label: 'Temporal', slug: 'Temporal' },
  { val: 'familia', label: 'Familia', slug: 'Familia' },
  { val: 'asociativa', label: 'Asociativa', slug: 'Asociativa' }
];

// ISAAR 6.3
const relationshipNatureOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 'creacion', label: 'Creación', slug: 'Creación' },
  { val: 'custodia', label: 'Custodia', slug: 'Custodia' },
  { val: 'publicacion', label: 'Publicación', slug: 'Publicación' },
  { val: 'contribucion', label: 'Contribución', slug: 'Contribución' },
  { val: 'coleccion', label: 'Colección', slug: 'Colección' },
  { val: 'acumulacion', label: 'Acumulación', slug: 'Acumulación' },
  { val: 'reproduccion', label: 'Reproducción', slug: 'Reproducción' },
  { val: 'difusion', label: 'Difusión', slug: 'Difusión' },
  { val: 'emision', label: 'Emisión', slug: 'Emisión' },
  { val: 'fabricacion', label: 'Fabricación', slug: 'Fabricación' },
  { val: 'mantenimiento', label: 'Mantenimiento de registros', slug: 'Mantenimiento de registros' }
];

// ISAAR 5.4.4
const elaborationStatusOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 'final', label: 'Final', slug: 'Final' },
  { val: 'revisado', label: 'Revisado', slug: 'Revisado' },
  { val: 'borrador', label: 'Borrador', slug: 'Borrador' }
];

// ISAAR 5.4.5
const detailLevelOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' },
  { val: 'completo', label: 'Completo', slug: 'Completo' },
  { val: 'parcial', label: 'Parcial', slug: 'Parcial' },
  { val: 'basico', label: 'Básico', slug: 'Básico' }
];

const countriesOptList: Array<any> = [
  { val: 'AR', label: 'Argentina', slug: 'Argentina', prefix: 'AR' },
  { val: 'XX', label: 'No listado', slug: 'No listado', prefix: 'XX '}
];

const defaultOptList: Array<any> = [
  { val: 'no_definido', label: 'Sin selección', slug: 'Sin selección' }
];

const optionsLists = {
  default: defaultOptList,
  entityType: entityTypeOptList,
  relationshipCategory: relationshipCategoryOptList,
  relationshipNature: relationshipNatureOptList,
  elaborationStatus: elaborationStatusOptList,
  detailLevel: detailLevelOptList,
  countries: countriesOptList
};

function getLabel(list, val) {
  const t = list.find((item) => item.val === val);
  return t ? t.label : val;
}

export class AuthorityRecordHelper {
  static cleanQueryToken(
    query: AuthorityRecordQuery
  ): AuthorityRecordQuery {
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

  static buildAuthorityRecordDataTable(
    itemList: AuthorityRecord[]
  ): AuthorityRecordTable[] {
    return itemList.map((token) => {
      const tableCell = new AuthorityRecordTable();

      tableCell._id = token._id;
      tableCell.entityType = AuthorityRecordHelper.getOptionLabel('entityType', token.identityArea.entityType);
      tableCell.authorizedName = token.identityArea.authorizedName;

      return tableCell;
    });
  }

  /**
   * Construye el  área de identificación - ISAAR 5.1
   */
  static buildIdentityArea(record: AuthorityRecord, data): AuthorityRecord {
    const identityArea = new AuthorityRecordIdentity();
    identityArea.countryPrefix = data.countryPrefix;
    identityArea.udaPrefix = data.udaPrefix;
    identityArea.entityType = data.entityType;
    identityArea.authorizedName = data.authorizedName;

    record.identityArea = identityArea;
    return record;
  }

  /**
   * Construye el área de descripción - ISAAR 5.2
   */
  static buildDescriptionArea(record: AuthorityRecord, data): AuthorityRecord {
    const descriptionArea = new AuthorityRecordDescription();
    descriptionArea.existenceDates = data.existenceDates;

    record.descriptionArea = descriptionArea;
    return record;
  }

  /**
   * Área de relacion - ISAAR 5.3
   */
  static pushRelatedAuthorityRecord(record: AuthorityRecord, data): AuthorityRecord {
    const related = new AuthorityRecordRelatedAuthorityRecord();
    related.authorityRecordId = data.authorityRecordId;
    related.authorityRecordName = data.authorityRecordName;
    related.authorityRecordType = data.authorityRecordType;
    related.category = data.category;

    if (!record.relationshipArea) {
      record.relationshipArea = new AuthorityRecordRelationship();
      record.relationshipArea.relatedAuthorityRecords = new Array<AuthorityRecordRelatedAuthorityRecord>();
      record.relationshipArea.relatedResources = new Array<AuthorityRecordRelatedArchivalDescription>();
    }

    record.relationshipArea.relatedAuthorityRecords.push(related);
    return record;
  }

  static removeRelatedAuthorityRecord(record: AuthorityRecord, item: AuthorityRecordRelatedAuthorityRecord): AuthorityRecord {
    const index = record.relationshipArea.relatedAuthorityRecords.indexOf(item);

    if (index >= 0) {
      record.relationshipArea.relatedAuthorityRecords.splice(index, 1);
    }

    return record;
  }

  static pushRelatedArchivalDescription(record: AuthorityRecord, data): AuthorityRecord {
    const related = new AuthorityRecordRelatedArchivalDescription();
    related.resourceId = data.resourceId;
    related.resourceTitle = data.resourceTitle;
    related.resourceIdentifier = data.resourceIdentifier;
    related.nature = data.nature;

    if (!record.relationshipArea) {
      record.relationshipArea = new AuthorityRecordRelationship();
      record.relationshipArea.relatedAuthorityRecords = new Array<AuthorityRecordRelatedAuthorityRecord>();
      record.relationshipArea.relatedResources = new Array<AuthorityRecordRelatedArchivalDescription>();
    }

    record.relationshipArea.relatedResources.push(related);
    return record;
  }

  static removeRelatedArchivalDescription(record: AuthorityRecord, item: AuthorityRecordRelatedArchivalDescription): AuthorityRecord {
    const index = record.relationshipArea.relatedResources.indexOf(item);

    if (index >= 0) {
      record.relationshipArea.relatedResources.splice(index, 1);
    }

    return record;
  }

  /**
   * Área de control - ISAAR 5.4
   */
  static buildControlArea(record: AuthorityRecord, data): AuthorityRecord {
    const controlArea = new AuthorityRecordControl();
    controlArea.identifier = data.identifier;

    record.controlArea = controlArea;
    return record;
  }
}
