import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthorityRecordService } from '../authority-record.service';
import { AuthorityRecord, AuthorityRecordRelatedAuthorityRecord, AuthorityRecordRelatedArchivalDescription } from '../authority-record.model';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { AuthorityRecordHelper } from '../authority-record.helper';
import { AuthorityRecordModalService } from '../authority-record-modal.service';
import { SharedService } from '../../../develar-commons/shared-service';


/** Definición de constantes */
const UNLISTED_COUNTRY_PREFIX = 'XX';


@Component({
  selector: 'authority-record-edit',
  templateUrl: './authority-record-edit.component.html',
  styleUrls: ['./authority-record-edit.component.scss'],
  providers: [AuthorityRecordModalService]
})
export class AuthorityRecordEditComponent implements OnInit {
  /**
   * Contiene el ID del registro de autoridad que se pretende editar
   */
  public authorityRecordId: string;
  /**
   * Contiene el registro que se está editando
   */
  public authorityRecord: AuthorityRecord;

  public areRelatedRecordsRemovable = true;
  public areRelatedResourcesRemovable = true;

  public pageTitle = 'Gestión de registros de autoridad';
  public form: FormGroup;

  /**
   * Arrays conteniendo los elementos de las optLists necesarias
   *
   */
  public entityTypeList = [];
  public countriesList = [];

  /** Determina si el A.R. se relaciona con otros AR */
  public hasRelatedAR: boolean;
  /** Determina si el A.R. se relaciona con alguna UDA */
  public hasRelatedUDA: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private authorityRecordService: AuthorityRecordService,
    private modalsService: AuthorityRecordModalService,
    private sharedService: SharedService
  ) {
    this.sharedService.emitChange(this.pageTitle);

    this.authorityRecordId = this.route.snapshot.params.id;

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

    this.hasRelatedAR = false;
    this.hasRelatedUDA = false;
  }

  ngOnInit(): void {
    this.entityTypeList = AuthorityRecordHelper.getOptionList('entityType');
    this.countriesList = AuthorityRecordHelper.getOptionList('countries');

    this.authorityRecordService.findById(this.authorityRecordId)
      .then(record => {
        if (record) {
          this.authorityRecord = record;
          this.initForm(this.authorityRecord);

          this.hasRelatedAR = this.authorityRecord &&
                              this.authorityRecord.relationshipArea &&
                              this.authorityRecord.relationshipArea.relatedAuthorityRecords.length > 0;

          this.hasRelatedAR = this.authorityRecord &&
                              this.authorityRecord.relationshipArea &&
                              this.authorityRecord.relationshipArea.relatedResources.length > 0;

        } else {
          this.notificationService.warn(
            'Registro con ID [%s] no encontrado.'
              .replace('%s', this.authorityRecordId)
          );

          this.router.navigate(['../..'], { relativeTo: this.route }).then();
        }
      })
      .catch(error => {
        this.notificationService.error(
          'Error al obtener el registro de autoridad con ID [%s]'
            .replace('%s', this.authorityRecordId)
        );

        this.router.navigate(['../..'], { relativeTo: this.route }).then();
    });
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


  /**
   * Inicializa el formulario de edición, precargándolo con los datos del
   * registro de autoridad obtenido
   *
   * Pre: record debe ser no-nulo y contener un registro de autoridad válido
   * Post: ninguna
   *
   * @param record registro de autoridad para precargar el formulario
   */
  private initForm(record: AuthorityRecord): void {
    this.form.reset({
      isArchivalInstitution: record.isArchivalInstitution,
      countryName: record.identityArea.countryPrefix,
      countryPrefix: record.identityArea.countryPrefix,
      udaPrefix: record.identityArea.udaPrefix,
      entityType: record.identityArea.entityType,
      authorizedName: record.identityArea.authorizedName,
      existenceDates: record.descriptionArea.existenceDates,
      identifier: record.controlArea.identifier
    });
  }

  public onSubmit(): void {
    const fvalue = this.form.value;
    const recordToUpdate = this.buildAuthorityRecord(fvalue);

    this.authorityRecordService.update(this.authorityRecordId, recordToUpdate).then(updated => {
      this.notificationService.success(
        'Registro de autoridad editado satisfactoriamente [%s]'
          .replace('%s', updated._id)
      );
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
    this.router.navigate(['../..'], { relativeTo: this.route }).then();
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
