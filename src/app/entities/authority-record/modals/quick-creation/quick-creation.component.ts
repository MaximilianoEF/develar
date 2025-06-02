import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthorityRecordHelper } from '../../authority-record.helper';
import { AuthorityRecord } from '../../authority-record.model';

@Component({
  selector: 'app-quick-creation',
  templateUrl: './quick-creation.component.html',
  styleUrls: ['./quick-creation.component.scss'],
})
export class QuickCreationComponent implements OnInit {
  public form: FormGroup;

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
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<QuickCreationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      entityType: [null, Validators.required],
      authorizedName: [null, Validators.required],
      existenceDates: [null],
      identifier: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.entityTypeList = AuthorityRecordHelper.getOptionList('entityType');
    this.countriesList = AuthorityRecordHelper.getOptionList('countries');
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public onSubmit(): void {
    const fvalue = this.form.value;
    const result = this.buildAuthorityRecord(fvalue);


    this.dialogRef.close(result);
  }

  private buildAuthorityRecord(data): AuthorityRecord {
    this.authorityRecord = AuthorityRecordHelper.buildIdentityArea(this.authorityRecord, data);
    this.authorityRecord = AuthorityRecordHelper.buildDescriptionArea(this.authorityRecord, data);
    this.authorityRecord = AuthorityRecordHelper.buildControlArea(this.authorityRecord, data);

    this.authorityRecord.isArchivalInstitution = data.isArchivalInstitution;

    return this.authorityRecord;
  }
}
