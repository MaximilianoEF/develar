import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { SharedService } from '../../../develar-commons/shared-service';
import { AuthorityRecordHelper } from '../authority-record.helper';
import {
  AuthorityRecord,
  AuthorityRecordRelatedArchivalDescription,
  AuthorityRecordRelatedAuthorityRecord,
} from '../authority-record.model';
import { AuthorityRecordService } from '../authority-record.service';
import { AuthorityRecordModalService } from '../authority-record-modal.service';

/** Definición de constantes */
const UNLISTED_COUNTRY_PREFIX = 'XX';

@Component({
  selector: 'authority-record-create',
  templateUrl: './authority-record-create.component.html',
  styleUrls: ['./authority-record-create.component.scss'],
  providers: [AuthorityRecordModalService]
})
export class AuthorityRecordCreateComponent implements OnInit {
  public pageTitle = 'Gestión de registros de autoridad';
  public form: FormGroup;
  public areRelatedRecordsRemovable = true;
  public areRelatedResourcesRemovable = true;

  /**
   * Arrays conteniendo los elementos de las optLists necesarias
   */
  public entityTypeList = [];
  public countriesList = [];

  /**
   * Mantiene el registro de autoridad que está siendo creado
   */
  public authorityRecord = new AuthorityRecord();

  constructor(
    private sharedService: SharedService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authorityRecordService: AuthorityRecordService,
    private modalsService: AuthorityRecordModalService
  ) {
    this.sharedService.emitChange(this.pageTitle);

    this.form = this.fb.group({
      isArchivalInstitution: [null],
      countryName: [null, Validators.required],
      countryPrefix: [null, Validators.required],
      udaPrefix: [null, Validators.required],
      entityType: [null, Validators.required],
      authorizedName: [null, Validators.required],
      existenceDates: [null, Validators.required],
      identifier: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.entityTypeList = AuthorityRecordHelper.getOptionList('entityType');
    this.countriesList = AuthorityRecordHelper.getOptionList('countries');
  }

  public onSelectionChange(key: string, val: string): void {
    if (key === 'countryName') {
      this.updateCountryPrefixField(val);
    }
  }

  public updateCountryPrefixField(prefix: string): void {
    if (prefix === UNLISTED_COUNTRY_PREFIX) {
      this.form.get('countryPrefix').setValue(null);
    } else {
      this.form.get('countryPrefix').setValue(prefix);
    }
  }

  public onSubmit(): void {
    const fvalue = this.form.value;
    const recordToSave = this.buildAuthorityRecord(fvalue);

    this.authorityRecordService.create(recordToSave).then(created => {
      this.notificationService.success(
        'Registro de autoridad creado satisfactoriamente [%s]'
          .replace('%s', created._id)
      );
      this.router.navigate(['..'], { relativeTo: this.route });
    });
  }

  private buildAuthorityRecord(data): AuthorityRecord {
    this.authorityRecord = AuthorityRecordHelper.buildIdentityArea(this.authorityRecord, data);
    this.authorityRecord = AuthorityRecordHelper.buildDescriptionArea(this.authorityRecord, data);
    this.authorityRecord = AuthorityRecordHelper.buildControlArea(this.authorityRecord, data);

    this.authorityRecord.isArchivalInstitution = !!data.isArchivalInstitution;

    return this.authorityRecord;
  }

  public cancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  public addRelatedAuthorityRecord(): void {
    const dialogRef = this.modalsService.setupRelatedAuthorityModal();

    dialogRef.subscribe(result => {
      this.authorityRecord = AuthorityRecordHelper.pushRelatedAuthorityRecord(this.authorityRecord, result);
    });
  }

  public removeRelatedAuthorityRecord(item: AuthorityRecordRelatedAuthorityRecord): void {
    this.authorityRecord = AuthorityRecordHelper.removeRelatedAuthorityRecord(this.authorityRecord, item);
  }

  public addRelatedArchivalDescription(): void {
    const dialogRef = this.modalsService.setupRelatedArchivalDescriptionmodal();
    dialogRef.subscribe(result => {
      this.authorityRecord = AuthorityRecordHelper.pushRelatedArchivalDescription(this.authorityRecord, result);
    });
  }

  public removeRelatedArchivalDescription(item: AuthorityRecordRelatedArchivalDescription): void {
    this.authorityRecord = AuthorityRecordHelper.removeRelatedArchivalDescription(this.authorityRecord, item);
  }

}
