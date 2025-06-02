export class AuthorityRecordQuery {
  entityType?: string;
  identifier?: string;
  authorizedName?: string;
  isArchivalInstitution?: boolean;
}

export class AuthorityRecordTable {
  _id?: string;
  entityType?: string;
  authorizedName?: string;
}

export class AuthorityRecordAudit {
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  lastModifiedAtTs?: number;

  createdBy?: string;
  createdAt?: string;
  createdAtTs?: number;
}

export class AuthorityRecordIdentity {
  countryPrefix: string;
  udaPrefix: string;

  entityType: string;
  authorizedName: string;
}

export class AuthorityRecordDescription {
  existenceDates: string;
}

export class AuthorityRecordRelatedAuthorityRecord {
  category: string;
  authorityRecordId: string;
  authorityRecordType: string;
  authorityRecordName: string;
}

export class AuthorityRecordRelatedArchivalDescription {
  resourceId: string;
  resourceIdentifier: string;
  resourceTitle: string;
  nature: string;
}

export class AuthorityRecordRelationship {
  relatedAuthorityRecords: Array<AuthorityRecordRelatedAuthorityRecord>;
  relatedResources: Array<AuthorityRecordRelatedArchivalDescription>;
}

export class AuthorityRecordControl {
  identifier: string;
}


export class AuthorityRecord {
  _id: string;

  identityArea: AuthorityRecordIdentity; // ISAAR 5.1
  descriptionArea: AuthorityRecordDescription; // ISAAR 5.2
  relationshipArea: AuthorityRecordRelationship; // ISAAR 5.3
  controlArea: AuthorityRecordControl; // ISAAR 5.4

  // Campo propio, con fines de auditoría; no especificado en ISAAR
  audit: AuthorityRecordAudit;

  // Campo propio que determina si el registro de autoridad es además una
  // institución archivística
  isArchivalInstitution: boolean;

  constructor() {
    this.identityArea = new AuthorityRecordIdentity();
    this.descriptionArea = new AuthorityRecordDescription();
    this.relationshipArea = new AuthorityRecordRelationship();
    this.relationshipArea.relatedAuthorityRecords = new Array<AuthorityRecordRelatedAuthorityRecord>();
    this.relationshipArea.relatedResources = new Array<AuthorityRecordRelatedArchivalDescription>();

    this.controlArea = new AuthorityRecordControl();

    this.audit = new AuthorityRecordAudit();
  }
}
